from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import bcrypt
from datetime import datetime

bp = Blueprint('users', __name__, url_prefix='/api/users')

def find_user_by_id(db, user_id):
    return db.users.find_one({'_id': ObjectId(user_id)})

def find_user_by_email(db, email):
    return db.users.find_one({'email': email})

@bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db
        
        current_user = find_user_by_id(db, current_user_id)
        
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Permission denied'}), 403
        
        users = list(db.users.find({}))
        users_data = []
        
        for user in users:
            users_data.append({
                'user_id': str(user['_id']),
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user['role'],
                'department': user.get('department'),
                'region': user.get('region'),
                'zone': user.get('zone'),
                'woreda': user.get('woreda'),
                'kebele': user.get('kebele'),
                'phone': user.get('phone'),
                'badge_number': user.get('badge_number'),
                'is_active': user.get('is_active', True),
                'last_login': user.get('last_login').isoformat() if user.get('last_login') else None,
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
            })
        
        return jsonify({'users': users_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db
        
        current_user = find_user_by_id(db, current_user_id)
        
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Only admin can create users'}), 403
        
        data = request.get_json()
        
        if find_user_by_email(db, data['email']):
            return jsonify({'error': 'Email already registered'}), 400
        
        if db.users.find_one({'badge_number': data['badge_number']}):
            return jsonify({'error': 'Badge number already exists'}), 400
        
        password_hash = bcrypt.hashpw(data.get('password', 'password123').encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_data = {
            'email': data['email'],
            'password_hash': password_hash,
            'full_name': data['full_name'],
            'role': data['role'],
            'department': data.get('department'),
            'region': data.get('region'),
            'zone': data.get('zone'),
            'woreda': data.get('woreda'),
            'kebele': data.get('kebele'),
            'phone': data.get('phone'),
            'badge_number': data['badge_number'],
            'office_name': data.get('office_name'),
            'is_active': data.get('is_active', True),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.users.insert_one(user_data)
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
