import os
import sys

print("🔧 COMPREHENSIVE FIX FOR ALL FILES...")

# Fix 1: Update run.py
run_py_content = '''from app import create_app

app = create_app()

if __name__ == '__main__':
    if app:
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to create Flask app")
'''

with open('run.py', 'w', encoding='utf-8') as f:
    f.write(run_py_content)
print("✅ Updated run.py")

# Fix 2: Update app/__init__.py to fix blueprint imports
init_py_content = '''from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
import os

def create_app():
    app = Flask(__name__)
    
    # Basic configuration
    app.config["SECRET_KEY"] = "dev-secret-key-change-in-production"
    app.config["JWT_SECRET_KEY"] = "jwt-secret-key-change-in-production"
    app.config["MONGODB_URI"] = "mongodb://localhost:27017/ethiopian_vital_management"
    app.config["UPLOAD_FOLDER"] = "./uploads"
    
    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    
    # Initialize MongoDB
    try:
        app.mongo = MongoClient(app.config["MONGODB_URI"])
        app.db = app.mongo.get_database()
        print("✅ MongoDB connected successfully!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None
    
    # Initialize extensions
    JWTManager(app)
    CORS(app)
    
    # Import and register blueprints
    try:
        # Import blueprints
        from app.routes import auth, births, users
        
        app.register_blueprint(auth.bp)
        app.register_blueprint(births.bp) 
        app.register_blueprint(users.bp)
        
        print("✅ Blueprints registered successfully!")
    except Exception as e:
        print(f"❌ Blueprint registration failed: {e}")
    
    return app
'''

with open('app/__init__.py', 'w', encoding='utf-8') as f:
    f.write(init_py_content)
print("✅ Updated app/__init__.py")

# Fix 3: Create routes/__init__.py to make it a proper package
routes_init_content = '''# Routes package
from .auth import bp as auth_bp
from .births import bp as births_bp
from .users import bp as users_bp

__all__ = ['auth_bp', 'births_bp', 'users_bp']
'''

with open('app/routes/__init__.py', 'w', encoding='utf-8') as f:
    f.write(routes_init_content)
print("✅ Updated app/routes/__init__.py")

# Fix 4: Update auth.py to use current_app
auth_py_content = '''from flask import Blueprint, request, jsonify, current_app
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
'''

with open('app/routes/auth.py', 'w', encoding='utf-8') as f:
    f.write(auth_py_content)
print("✅ Updated app/routes/auth.py")

print("\\n🎉 ALL FILES FIXED!")
print("🚀 Now run: python run.py")