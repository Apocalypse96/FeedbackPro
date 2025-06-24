from flask import Blueprint, request, jsonify
from models import db, User

users_bp = Blueprint('users', __name__)

def get_current_user_from_request():
    """Get current user from X-User-ID header (hardcoded auth)"""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return None
    
    try:
        user_id = int(user_id)
        # Hardcoded user mapping
        if user_id == 1:
            return {"id": 1, "name": "John Manager", "email": "manager1@company.com", "role": "manager"}
        elif user_id == 2:
            return {"id": 2, "name": "Jane Employee", "email": "employee1@company.com", "role": "employee", "manager_id": 1}
        elif user_id == 3:
            return {"id": 3, "name": "Bob Employee", "email": "employee2@company.com", "role": "employee", "manager_id": 1}
        else:
            return None
    except (ValueError, TypeError):
        return None

@users_bp.route('/team', methods=['GET'])
def get_team_members():
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = current_user['id']
        
        if current_user['role'] != 'manager':
            return jsonify({'error': 'Only managers can view team members'}), 403
        
        team_members = User.query.filter_by(manager_id=user_id).all()
        
        return jsonify({
            'team_members': [member.to_dict() for member in team_members]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/managers', methods=['GET'])
def get_managers():
    try:
        managers = User.query.filter_by(role='manager').all()
        return jsonify({
            'managers': [{'id': m.id, 'name': m.name, 'email': m.email} for m in managers]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 