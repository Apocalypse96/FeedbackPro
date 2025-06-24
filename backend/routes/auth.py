from flask import Blueprint, request, jsonify, session
from models import db, User

auth_bp = Blueprint('auth', __name__)

# Hardcoded users for simplicity (matching frontend)
HARDCODED_USERS = {
    "manager1@company.com": {
        "id": 1,
        "name": "John Manager",
        "email": "manager1@company.com",
        "role": "manager",
        "password": "password123"
    },
    "employee1@company.com": {
        "id": 2,
        "name": "Jane Employee",
        "email": "employee1@company.com",
        "role": "employee",
        "manager_id": 1,
        "password": "password123"
    },
    "employee2@company.com": {
        "id": 3,
        "name": "Bob Employee",
        "email": "employee2@company.com",
        "role": "employee",
        "manager_id": 1,
        "password": "password123"
    }
}

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = HARDCODED_USERS.get(email)
        
        if user and user['password'] == password:
            # Return user without password
            user_data = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({
                'access_token': 'dummy_token',  # Frontend expects this but won't use it
                'user': user_data
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        return jsonify({'error': 'Registration not available in demo mode'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        # For hardcoded auth, we don't need this endpoint
        # Frontend will manage user state directly
        return jsonify({'error': 'Not implemented in demo mode'}), 501
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 