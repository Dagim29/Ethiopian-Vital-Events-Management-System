from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from datetime import datetime
from bson import ObjectId

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def find_user_by_email(db, email):
    """Find user by email"""
    return db.users.find_one({'email': email})

def find_user_by_id(db, user_id):
    """Find user by ID"""
    return db.users.find_one({'_id': ObjectId(user_id)})

def update_last_login(db, user_id):
    """Update user's last login time"""
    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'last_login': datetime.utcnow()}}
    )

@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Use current_app to get database
        db = current_app.db
        
        user = find_user_by_email(db, data['email'])
        
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
            if not user.get('is_active', True):
                return jsonify({'error': 'Account is deactivated'}), 403
            
            # Update last login
            update_last_login(db, user['_id'])
            
            # Create access token
            access_token = create_access_token(
                identity=str(user['_id']),
                additional_claims={
                    'role': user['role'],
                    'email': user['email'],
                    'full_name': user['full_name']
                }
            )
            
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': {
                    'user_id': str(user['_id']),
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'role': user['role'],
                    'region': user.get('region'),
                    'zone': user.get('zone'),
                    'woreda': user.get('woreda'),
                    'kebele': user.get('kebele'),
                    'department': user.get('department'),
                    'badge_number': user.get('badge_number')
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        db = current_app.db
        
        user = find_user_by_id(db, current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not bcrypt.checkpw(data.get('current_password', '').encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        new_password_hash = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': {'password_hash': new_password_hash, 'updated_at': datetime.utcnow()}}
        )
        
        return jsonify({'message': 'Password updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db
        
        user = find_user_by_id(db, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'user_id': str(user['_id']),
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user['role'],
                'region': user.get('region'),
                'zone': user.get('zone'),
                'woreda': user.get('woreda'),
                'kebele': user.get('kebele'),
                'department': user.get('department'),
                'phone': user.get('phone'),
                'badge_number': user.get('badge_number'),
                'office_name': user.get('office_name'),
                'is_active': user.get('is_active', True),
                'last_login': user.get('last_login').isoformat() if user.get('last_login') else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
