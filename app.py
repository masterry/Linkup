from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import hashlib
import sqlite3
import datetime
import uuid


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your_secret_key'

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
    conn.close()

    return jsonify({'message': 'Account created successfully', 'userID': userID}), 201


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
        'token': token
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
    user = conn.execute('SELECT * FROM user WHERE userID = ?', (userID,)).fetchone()
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



if __name__ == '__main__':
    app.run(debug=True)
