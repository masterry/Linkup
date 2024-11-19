from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import jwt
import hashlib
import sqlite3
import datetime
import uuid
from geopy.distance import geodesic
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os
import json


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your_secret_key'


# Set upload folder and allowed file extensions
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Check if the file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Ensure the upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


class User:
    def __init__(self, userID, email, password, name, age, gender, location, preferencesID=None):
        self.userID = userID
        self.email = email
        self.password = password
        self.name = name
        self.age = age
        self.gender = gender
        self.location = location
        self.preferencesID = preferencesID
        self.bio = ""
        self.profilePicture = None


    def generate_userID(self):
        # Generate a unique user ID (you can customize this)
        return str(uuid.uuid4())

class Preferences:
    def __init__(self, min_age, max_age, gender_preference, distance_preference):
        self.minAge = min_age
        self.maxAge = max_age
        self.genderPreference = gender_preference
        self.distancePreference = distance_preference


class Message:
    def __init__(self, messageID, sender, recipient, content):
        self.messageID = messageID
        self.sender = sender
        self.recipient = recipient
        self.content = content
        self.timestamp = datetime.datetime.now()


class Swipe:
    def __init__(self, user, target_user, direction):
        self.user = user
        self.target_user = target_user
        self.direction = direction
        self.swipeID = None  # This will be set after saving to the database

    def save_to_db(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO swipe (user, targetUser, direction) VALUES (?, ?, ?)',
            (self.user, self.target_user, self.direction)
        )
        self.swipeID = cursor.lastrowid  # Get the last inserted ID
        conn.commit()
        conn.close()




class Match:
    def __init__(self, matchID, user1, user2):
        self.matchID = matchID
        self.user1 = user1
        self.user2 = user2
        self.timestamp = self.get_current_timestamp()

    def get_current_timestamp(self):
        return datetime.now()

    def initiateChat(self):
        return f"Chat initiated between {self.user1} and {self.user2}."

class NotificationService:
    def notify_user(self, userID, message):
        # Logic to send a notification to the user
        print(f"Notification sent to {userID}: {message}")

    def notify_new_match(self, match):
        message1 = f"You have a new match with {match.user2}!"
        message2 = f"You have a new match with {match.user1}!"
        self.notify_user(match.user1, message1)
        self.notify_user(match.user2, message2)


def get_db_connection():
    conn = sqlite3.connect('linkup.db')
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()



@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    # Check if the email already exists
    user = cursor.fetchone()
    if user:
        conn.close()
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = hash_password(password)  # Insert new user
    cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
    conn.commit()

    # Get the userID of the newly created user
    userID = cursor.lastrowid  # This retrieves the last inserted row ID

    # Create a new preferences entry
    cursor.execute("INSERT INTO preferences DEFAULT VALUES")
    conn.commit()

    # Get the preferencesID of the newly created preferences
    preferencesID = cursor.lastrowid

    # Update the user record to associate it with preferencesID
    cursor.execute("UPDATE users SET preferencesID = ? WHERE userID = ?", (preferencesID, userID))
    conn.commit()

    # Close the connection
    conn.close()

    # Return the userID along with the success message
    return jsonify({'message': 'Account created successfully', 'userID': userID, 'preferencesID': preferencesID}), 201


@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
    finally:
        conn.close()

    if not user or hash_password(password) != user['password']:
        return jsonify({'message': 'Invalid email or password'}), 401

    token = jwt.encode({
        'email': user['email'],
        'exp': datetime.utcnow() + timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'message': 'Signed in successfully',
        'token': token,
        'userID': user['userID']  # Adjust if your column name is different
    })

@app.route('/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing'}), 403

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return jsonify({'message': f'Welcome {data["email"]}'})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401




@app.route('/api/swipes', methods=['POST'])
def swipes():
    data = request.get_json()

    user = data.get('user')
    target_user = data.get('targetUser')
    direction = data.get('direction')

    # Input validation
    if not user or not target_user or direction not in ['like', 'dislike']:
        return jsonify({'message': 'Invalid input'}), 400

    # Create a Swipe instance
    swipe_instance = Swipe(user, target_user, direction)

    # Save the swipe record into the database
    swipe_instance.save_to_db()

    print(f"Swipe recorded: user={user}, target_user={target_user}, direction={direction}, swipeID={swipe_instance.swipeID}")

    # Retrieve targetUser's name and userID from the users table
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT userID, name FROM users WHERE userID = ?', (target_user,))
    target_user_data = cursor.fetchone()

    if target_user_data:
        recipient_name = target_user_data['name']
        recipient = target_user_data['userID']
    else:
        return jsonify({'message': 'Target user not found'}), 404

    # Check for mutual 'like' to create a match
    if direction == 'like':
        cursor.execute(
            'SELECT * FROM swipe WHERE user = ? AND targetUser = ? AND direction = ?',
            (target_user, user, 'like')
        )

        if cursor.fetchone():  # If there is a mutual 'like'
            # Create a match in the match table
            cursor.execute(
                'INSERT INTO match (user1, user2) VALUES (?, ?)',
                (user, target_user)
            )
            match_id = cursor.lastrowid
            conn.commit()
            conn.close()
            return jsonify({'swipeID': swipe_instance.swipeID, 'matchID': match_id,
                            'recipient_name': recipient_name, 'recipient': recipient,
                            'message': 'Swipe recorded and match created'}), 201

        conn.close()

    return jsonify({'swipeID': swipe_instance.swipeID, 'recipient_name': recipient_name, 'recipient': recipient,
                    'message': 'Swipe recorded'}), 201





@app.route('/api/users/<userID>', methods=['GET'])
def get_user(userID):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE userID = ?', (userID,)).fetchone()
    conn.close()

    if user is None:
        return jsonify({'error': 'User not found'}), 404

    user_data = {
        'userID': user['userID'],
        'email': user['email'],
        'name': user['name'],
        'age': user['age'],
        'gender': user['gender'],
        'location': user['location'],
        'bio': user['bio'],
        'profilePicture': user['profilePicture'],
        'preferencesID': user['preferencesID']
    }
    return jsonify(user_data)



@app.route('/api/usersprofile/<int:userID>', methods=['PUT'])
def update_users(userID):
    # Log incoming request data
    print(f"Received PUT request for userID: {userID}")
    print(f"Request Form: {request.form}")
    print(f"Request Files: {request.files}")

    # Handle the file upload and form data from the request
    if 'profilePicture' in request.files:
        file = request.files['profilePicture']
        if file and allowed_file(file.filename):
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            file_path = os.path.join('uploads', filename)  # Assuming "uploads" folder is used for profile pictures
            file.save(os.path.join(os.getcwd(), file_path))  # Save file to the uploads folder
        else:
            return jsonify({"error": "Invalid file type"}), 400
    else:
        file_path = None  # No file provided

    # Handle the form data (text fields) as JSON or form data (can have both)
    name = request.form.get('name')
    age = request.form.get('age')
    gender = request.form.get('gender')
    location = request.form.get('location')  # Expecting a string like "34.2526651, 35.6633782"
    bio = request.form.get('bio')

    print(f"Name: {name}, Age: {age}, Gender: {gender}, Location: {location}, Bio: {bio}")

    # If location is provided, convert it from stringified array to a proper list
    if location:
        try:
            # If location is already a stringified array (e.g., '[34.2526651, 35.6633782]')
            location = json.loads(location)  # Convert stringified array back to list
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid location format"}), 400
    else:
        location = None  # No location provided

    # If any required form data is missing, handle it appropriately
    if None in [name, age, gender, bio]:
        return jsonify({"error": "Missing data"}), 400

    # Prepare the update fields, ignoring missing ones
    update_fields = []
    update_values = []

    if name:
        update_fields.append("name = ?")
        update_values.append(name)

    if age:
        update_fields.append("age = ?")
        update_values.append(age)

    if gender:
        update_fields.append("gender = ?")
        update_values.append(gender)

    if location:
        update_fields.append("location = ?")
        update_values.append(json.dumps(location))  # Store location as a JSON string

    if bio:
        update_fields.append("bio = ?")
        update_values.append(bio)

    if file_path:
        update_fields.append("profilePicture = ?")
        update_values.append(file_path)

    if not update_fields:
        return jsonify({"error": "No valid data to update"}), 400

    # Add the userID at the end for the WHERE clause
    update_values.append(userID)
    update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE userID = ?"

    # Connect to the database and execute the update query
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(update_query, tuple(update_values))
    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully"}), 200





@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)


@app.route('/api/userprofile/<int:userID>/profile-picture', methods=['PUT'])
def update_profile_picture(userID):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # Save the file
        file.save(file_path)

        # Now, update the profile picture in the database
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            UPDATE users 
            SET profilePicture = ? 
            WHERE userID = ?
        ''', (file_path, userID))

        conn.commit()
        conn.close()

        return jsonify({"message": "Profile picture updated successfully", "file_path": file_path})

    return jsonify({"error": "Invalid file type"}), 400


@app.route('/api/user/preferences/<int:userID>', methods=['PUT'])
def update_preferences(userID):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    min_age = data.get("minAge")
    max_age = data.get("maxAge")
    gender_preference = data.get("genderPreference")
    distance_preference = data.get("distancePreference")

    if None in (min_age, max_age, gender_preference, distance_preference):
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Retrieve the preferencesID associated with the userID
    cursor.execute('''
        SELECT preferencesID FROM users 
        WHERE userID = ?
    ''', (userID,))
    result = cursor.fetchone()

    if result is None or result[0] is None:
        # Create new preferences if preferencesID is empty or does not exist
        cursor.execute('''
            INSERT INTO Preferences (minAge, maxAge, genderPreference, distancePreference) 
            VALUES (?, ?, ?, ?)
        ''', (min_age, max_age, gender_preference, distance_preference))

        # Update the users table to associate the new preferencesID with the user
        preferencesID = cursor.lastrowid
        cursor.execute('''
            UPDATE users 
            SET preferencesID = ? 
            WHERE userID = ?
        ''', (preferencesID, userID))

        conn.commit()
        conn.close()
        return jsonify({"message": "Preferences created successfully"}), 201  # Removed preferencesID from response

    preferencesID = result[0]

    # Update preferences if preferencesID exists
    cursor.execute('''
        UPDATE Preferences 
        SET minAge = ?, maxAge = ?, genderPreference = ?, distancePreference = ? 
        WHERE preferencesID = ?
    ''', (min_age, max_age, gender_preference, distance_preference, preferencesID))

    conn.commit()
    conn.close()
    return jsonify({"message": "Preferences updated successfully"})

@app.route('/api/userprofile/<int:userID>', methods=['DELETE'])
def delete_user(userID):
    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the user exists
    cursor.execute("SELECT * FROM users WHERE userID = ?", (userID,))
    user = cursor.fetchone()

    if user is None:
        conn.close()
        return jsonify({'message': 'User not found'}), 404

    # Delete the user
    cursor.execute("DELETE FROM users WHERE userID = ?", (userID,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User profile deleted successfully'}), 200


@app.route('/api/matches/<int:user_id>', methods=['GET'])
def get_matches(user_id):
    conn = sqlite3.connect('linkup.db')
    cursor = conn.cursor()

    # Fetch user preferences
    cursor.execute('''
        SELECT p.minAge, p.maxAge, p.genderPreference, p.distancePreference, u.location, u.age, u.gender 
        FROM users u 
        JOIN preferences p ON u.preferencesID = p.preferencesID 
        WHERE u.userID = ?
    ''', (user_id,))

    user_data = cursor.fetchone()
    conn.close()

    if not user_data:
        return jsonify({'error': 'User not found or no preferences available'}), 404

    min_age, max_age, gender_preference, max_distance, user_location, user_age, user_gender = user_data

    # Clean and parse the user_location
    user_location = user_location.strip('[]')  # Remove brackets
    try:
        user_lat, user_lng = map(float, user_location.split(','))
    except ValueError as e:
        return jsonify({'error': 'Invalid location format for user'}), 400

    # Fetch potential matches excluding swiped users
    conn = sqlite3.connect('linkup.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT u.userID, u.name, u.profilePicture, u.location, u.age, u.gender 
        FROM users u
        WHERE u.userID != ? 
        AND u.userID NOT IN (
            SELECT targetUser 
            FROM swipe 
            WHERE user = ?
        )
    ''', (user_id, user_id))

    potential_matches = cursor.fetchall()
    conn.close()

    matches = []

    for match in potential_matches:
        match_id, match_name, match_profile_picture, match_location, match_age, match_gender = match

        # Clean and parse the match_location
        match_location = match_location.strip('[]')  # Remove brackets
        try:
            match_lat, match_lng = map(float, match_location.split(','))
        except ValueError as e:
            print(f"Error parsing match location {match_location}: {e}")  # Debugging line
            continue  # Skip this match if the location format is incorrect

        distance = geodesic((user_lat, user_lng), (match_lat, match_lng)).km

        # Check if within distance preference
        if distance > max_distance:
            continue

        # Check age and gender preference
        if min_age <= match_age <= max_age:
            if gender_preference in ['Any', match_gender]:  # Assuming 'Any' means any gender
                matches.append({
                    'userID': match_id,
                    'name': match_name,
                    'profilePicture': match_profile_picture,
                    'age': match_age,
                    'location': match_location,
                    'distance': distance
                })

    return jsonify(matches)


@app.route('/update_location/<int:user_id>', methods=['POST'])
def update_location(user_id):
    data = request.get_json()
    location = data.get('location')  # Get the location as a single string

    # Check if location is provided
    if not location:
        return jsonify({"error": "Location data is required"}), 400

    # Update SQLite database with new location
    conn = sqlite3.connect('linkup.db')
    cursor = conn.cursor()

    # Assuming you have a 'users' table with 'userID' and 'location' columns
    cursor.execute('UPDATE users SET location = ? WHERE userID = ?', (location, user_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Location updated successfully"}), 200



@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    sender = data['sender']
    recipient = data['recipient']
    content = data['content']
    timestamp = data.get('timestamp', None)  # Optional, if you want to allow client-side timestamps

    if timestamp is None:
        timestamp = datetime.now().isoformat()  # Generate current timestamp

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO messages (sender, recipient, content, timestamp) VALUES (?, ?, ?, ?)',
                   (sender, recipient, content, timestamp))
    conn.commit()
    conn.close()

    return jsonify({'status': 'Message sent', 'timestamp': timestamp}), 201


@app.route('/get_messages', methods=['GET'])
def get_messages():
    sender = request.args.get('sender')
    recipient = request.args.get('recipient')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT m.sender, m.recipient, m.content, m.timestamp, u1.name AS sender_name, u2.name AS recipient_name
        FROM messages m
        JOIN users u1 ON m.sender = u1.userID
        JOIN users u2 ON m.recipient = u2.userID
        WHERE (m.sender = ? AND m.recipient = ?) OR (m.sender = ? AND m.recipient = ?)
    ''', (sender, recipient, recipient, sender))

    messages = cursor.fetchall()
    conn.close()

    # Convert messages to a list of dictionaries, including sender and recipient names
    return jsonify([{
        'sender': message['sender'],
        'recipient': message['recipient'],
        'sender_name': message['sender_name'],  # Sender's name from users table
        'recipient_name': message['recipient_name'],  # Recipient's name from users table
        'content': message['content'],  # Content of the message
        'timestamp': message['timestamp']
    } for message in messages]), 200




@app.route('/get_user_chat_history/<int:user_id>', methods=['GET'])
def get_user_chat_history(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get distinct users the logged-in user has chatted with (either as sender or recipient)
    cursor.execute('''
        SELECT DISTINCT CASE 
                            WHEN sender = ? THEN recipient 
                            ELSE sender 
                        END AS other_user
        FROM messages
        WHERE sender = ? OR recipient = ?
    ''', (user_id, user_id, user_id))

    users = cursor.fetchall()

    latest_messages = []

    for user in users:
        other_user = user['other_user']

        # Get the most recent message between the logged-in user and the other user
        cursor.execute('''
            SELECT content, timestamp
            FROM messages
            WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)
            ORDER BY timestamp DESC LIMIT 1
        ''', (user_id, other_user, other_user, user_id))

        last_message = cursor.fetchone()

        # Get the name of the other user from the users table
        cursor.execute('''
            SELECT name
            FROM users
            WHERE userID = ?
        ''', (other_user,))

        user_name = cursor.fetchone()

        # Add the other user's ID, name, and the last message to the result
        latest_messages.append({
            'user_id': other_user,
            'user_name': user_name['name'] if user_name else 'Unknown',
            'last_message': last_message['content'] if last_message else 'No messages',
            'timestamp': last_message['timestamp'] if last_message else None
        })

    conn.close()

    return jsonify(latest_messages), 200




@app.route('/create_match', methods=['POST'])
def create_match():
    data = request.get_json()
    user1 = data.get('user1')
    user2 = data.get('user2')

    if not user1 or not user2:
        return jsonify({"error": "Missing user data"}), 400

    # Automatically create a unique matchID
    matchID = str(uuid.uuid4())

    # Insert match into the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO match (matchID, user1, user2) VALUES (?, ?, ?)",
        (matchID, user1, user2)
    )
    conn.commit()
    conn.close()

    # Create Match instance and notify users
    new_match = Match(matchID, user1, user2)
    notification_service = NotificationService()
    notification_service.notify_new_match(new_match)

    return jsonify({"message": "Match created successfully", "match": str(new_match)}), 201


@app.route('/new/chat', methods=['POST'])
def new_chat():
    data = request.json

    # Validate input
    if not all(key in data for key in ('sender', 'recipient', 'content')):
        return jsonify({'error': 'Missing data'}), 400

    sender = data['sender']
    recipient = data['recipient']
    content = data['content']

    # Prepare timestamp
    timestamp = datetime.now().isoformat()  # Use the imported datetime

    # Insert into database
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('INSERT INTO messages (sender, recipient, content, timestamp) VALUES (?, ?, ?, ?)',
                   (sender, recipient, content, timestamp))
    conn.commit()

    # Get the last inserted message ID
    messageID = cursor.lastrowid
    conn.close()

    return jsonify({'messageID': messageID, 'sender': sender, 'recipient': recipient, 'content': content,
                    'timestamp': timestamp}), 201




if __name__ == '__main__':
    app.run(debug=True)
