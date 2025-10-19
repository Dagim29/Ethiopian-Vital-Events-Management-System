from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
import os

def create_app():
    app = Flask(__name__)
    
    # Basic configuration
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-change-in-production'
    app.config['MONGODB_URI'] = 'mongodb://localhost:27017/ethiopian_vital_management'
    app.config['UPLOAD_FOLDER'] = './uploads'
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize MongoDB
    try:
        app.mongo = MongoClient(app.config['MONGODB_URI'])
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
        from .routes.auth import bp as auth_bp
        from .routes.births import bp as births_bp
        from .routes.users import bp as users_bp
        
        app.register_blueprint(auth_bp)
        app.register_blueprint(births_bp)
        app.register_blueprint(users_bp)
        
        print("✅ Blueprints registered successfully!")
    except Exception as e:
        print(f"❌ Blueprint registration failed: {e}")
    
    return app