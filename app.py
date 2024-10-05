from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import hashlib
import sqlite3
import datetime
import uuid
from geopy.distance import geodesic


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your_secret_key'


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
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or hash_password(password) != user['password']:
        return jsonify({'message': 'Invalid email or password'}), 401

    token = jwt.encode({
        'email': user['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'message': 'Signed in successfully',
        'token': token,
        'userID': user['userID']  # Assuming 'id' is the column name for userID in your database
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


@app.route('/api/swipe', methods=['POST'])
def swipe():
    data = request.get_json()

    user = data.get('user')
    target_user = data.get('targetUser')
    direction = data.get('direction')

    # Input validation
    if not user or not target_user or direction not in ['like', 'dislike']:
        return jsonify({'message': 'Invalid input'}), 400

    swipe_id = str(uuid.uuid4())

    # Insert the swipe record into the database
    conn = sqlite3.connect('linkup.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO swipe (swipeID, user, targetUser, direction)
        VALUES (?, ?, ?, ?)
    ''', (swipe_id, user, target_user, direction))
    conn.commit()
    conn.close()

    return jsonify({'swipeID': swipe_id, 'message': 'Swipe recorded'}), 201


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


@app.route('/api/userprofile/<int:userID>', methods=['PUT'])
def update_user(userID):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    location = data.get("location")
    bio = data.get("bio")
    profilePicture = data.get("profilePicture")

    if None in (name, age, gender, location, bio):
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE users 
        SET name = ?, age = ?, gender = ?, location = ?, bio = ?, profilePicture = ? 
        WHERE userID = ?
    ''', (name, age, gender, location, bio, profilePicture, userID))

    conn.commit()
    conn.close()
    return jsonify({"message": "Profile updated successfully"})


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

    # Fetch potential matches
    conn = sqlite3.connect('linkup.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT userID, name, profilePicture, location, age, gender 
        FROM users 
        WHERE userID != ?
    ''', (user_id,))
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


if __name__ == '__main__':
    app.run(debug=True)
