import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # MongoDB
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/ethiopian_vital_management'
    
    # File Uploads
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or './uploads'
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH') or 16777216)
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'}