from datetime import datetime
import bcrypt
from bson import ObjectId

class User:
    @staticmethod
    def create_user(db, user_data):
        """Create a new user in MongoDB"""
        users_collection = db.users
        
        # Check if email already exists
        if users_collection.find_one({'email': user_data['email']}):
            return None, 'Email already exists'
        
        # Check if badge number exists
        if users_collection.find_one({'badge_number': user_data['badge_number']}):
            return None, 'Badge number already exists'
        
        # Hash password
        password_hash = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_doc = {
            'email': user_data['email'],
            'password_hash': password_hash,
            'full_name': user_data['full_name'],
            'role': user_data['role'],
            'department': user_data.get('department'),
            'region': user_data.get('region'),
            'zone': user_data.get('zone'),
            'woreda': user_data.get('woreda'),
            'kebele': user_data.get('kebele'),
            'phone': user_data.get('phone'),
            'badge_number': user_data['badge_number'],
            'office_name': user_data.get('office_name'),
            'is_active': user_data.get('is_active', True),
            'permissions': user_data.get('permissions', {}),
            'photo_url': user_data.get('photo_url'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': None
        }
        
        result = users_collection.insert_one(user_doc)
        return str(result.inserted_id), None
    
    @staticmethod
    def find_by_email(db, email):
        """Find user by email"""
        return db.users.find_one({'email': email})
    
    @staticmethod
    def find_by_id(db, user_id):
        """Find user by ID"""
        return db.users.find_one({'_id': ObjectId(user_id)})
    
    @staticmethod
    def update_last_login(db, user_id):
        """Update user's last login time"""
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'last_login': datetime.utcnow()}}
        )
    
    @staticmethod
    def get_all_users(db):
        """Get all users"""
        return list(db.users.find({}))

class BirthRecord:
    @staticmethod
    def create_record(db, record_data):
        """Create a new birth record"""
        births_collection = db.birth_records
        
        record_doc = {
            **record_data,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = births_collection.insert_one(record_doc)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_id(db, record_id):
        """Find birth record by ID"""
        return db.birth_records.find_one({'_id': ObjectId(record_id)})
    
    @staticmethod
    def find_by_certificate(db, certificate_number):
        """Find birth record by certificate number"""
        return db.birth_records.find_one({'certificate_number': certificate_number})
    
    @staticmethod
    def get_all_records(db, filters=None, page=1, per_page=20):
        """Get all birth records with pagination"""
        if filters is None:
            filters = {}
        
        skip = (page - 1) * per_page
        cursor = db.birth_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page)
        
        records = list(cursor)
        total = db.birth_records.count_documents(filters)
        
        return records, total
    
    @staticmethod
    def update_record(db, record_id, update_data):
        """Update birth record"""
        update_data['updated_at'] = datetime.utcnow()
        
        result = db.birth_records.update_one(
            {'_id': ObjectId(record_id)},
            {'$set': update_data}
        )
        
        return result.modified_count > 0

class DeathRecord:
    @staticmethod
    def create_record(db, record_data):
        """Create a new death record"""
        deaths_collection = db.death_records
        
        record_doc = {
            **record_data,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = deaths_collection.insert_one(record_doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_all_records(db, filters=None, page=1, per_page=20):
        """Get all death records with pagination"""
        if filters is None:
            filters = {}
        
        skip = (page - 1) * per_page
        cursor = db.death_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page)
        
        records = list(cursor)
        total = db.death_records.count_documents(filters)
        
        return records, total

class MarriageRecord:
    @staticmethod
    def create_record(db, record_data):
        """Create a new marriage record"""
        marriages_collection = db.marriage_records
        
        record_doc = {
            **record_data,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = marriages_collection.insert_one(record_doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_all_records(db, filters=None, page=1, per_page=20):
        """Get all marriage records with pagination"""
        if filters is None:
            filters = {}
        
        skip = (page - 1) * per_page
        cursor = db.marriage_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page)
        
        records = list(cursor)
        total = db.marriage_records.count_documents(filters)
        
        return records, total

class DivorceRecord:
    @staticmethod
    def create_record(db, record_data):
        """Create a new divorce record"""
        divorces_collection = db.divorce_records
        
        record_doc = {
            **record_data,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = divorces_collection.insert_one(record_doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_all_records(db, filters=None, page=1, per_page=20):
        """Get all divorce records with pagination"""
        if filters is None:
            filters = {}
        
        skip = (page - 1) * per_page
        cursor = db.divorce_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page)
        
        records = list(cursor)
        total = db.divorce_records.count_documents(filters)
        
        return records, total