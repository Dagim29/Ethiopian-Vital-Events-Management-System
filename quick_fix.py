import os
import sys

print("🔧 APPLYING QUICK FIX...")

# Fix 1: Rename init.py to __init__.py
app_dir = os.path.join('app')
init_file = os.path.join(app_dir, 'init.py')
init_file_fixed = os.path.join(app_dir, '__init__.py')

if os.path.exists(init_file) and not os.path.exists(init_file_fixed):
    os.rename(init_file, init_file_fixed)
    print("✅ Renamed init.py to __init__.py")

# Fix 2: Check if __init__.py has create_app function
init_content = '''from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
import os

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "dev-secret-key"
    app.config["JWT_SECRET_KEY"] = "jwt-secret-key" 
    app.config["MONGODB_URI"] = "mongodb://localhost:27017/ethiopian_vital_management"
    app.config["UPLOAD_FOLDER"] = "./uploads"
    
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    
    try:
        app.mongo = MongoClient(app.config["MONGODB_URI"])
        app.db = app.mongo.get_database()
        print("✅ MongoDB connected successfully!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None
    
    JWTManager(app)
    CORS(app)
    
    try:
        from app.routes.auth import bp as auth_bp
        from app.routes.births import bp as births_bp
        from app.routes.users import bp as users_bp
        
        app.register_blueprint(auth_bp)
        app.register_blueprint(births_bp)
        app.register_blueprint(users_bp)
        print("✅ Blueprints registered successfully!")
    except Exception as e:
        print(f"❌ Blueprint registration failed: {e}")
    
    return app
'''

with open(init_file_fixed, 'w', encoding='utf-8') as f:
    f.write(init_content)
print("✅ Updated __init__.py with create_app function")

# Test the import
print("🧪 Testing import...")
try:
    from app import create_app
    print("✅ SUCCESS: create_app imported!")
    
    app = create_app()
    if app:
        print("✅ Flask app created successfully!")
        print("🎉 BACKEND IS NOW FIXED!")
    else:
        print("❌ Flask app creation failed")
        
except ImportError as e:
    print(f"❌ Import error: {e}")

print("\n🚀 Now run: python run.py")