from app import create_app
import bcrypt
from datetime import datetime

def init_database():
    app = create_app()
    
    if app is None:
        print("❌ Failed to create Flask app")
        return
    
    with app.app_context():
        db = app.db
        
        # Check if admin user exists
        admin_user = db.users.find_one({'email': 'admin@vms.gov.et'})
        if not admin_user:
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            admin_data = {
                'email': 'admin@vms.gov.et',
                'password_hash': password_hash,
                'full_name': 'System Administrator',
                'role': 'admin',
                'department': 'ICT',
                'region': 'ADDIS ABABA',
                'zone': 'Central',
                'woreda': '01',
                'kebele': '01',
                'phone': '+251911223344',
                'badge_number': 'ADMIN001',
                'office_name': 'Head Office',
                'is_active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            result = db.users.insert_one(admin_data)
            print("✅ Admin user created successfully!")
            print(f"   User ID: {result.inserted_id}")
        else:
            print("✅ Admin user already exists!")
        
        print("🎉 Database initialization completed!")

if __name__ == '__main__':
    init_database()