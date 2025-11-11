import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from app import create_app
    print("✅ Successfully imported create_app!")
    
    app = create_app()
    if app:
        print("✅ Flask app created successfully!")
        
        # Now initialize the database
        import bcrypt
        from datetime import datetime
        
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
    else:
        print("❌ Failed to create Flask app")
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nLet's try a different approach...")
    
    # Alternative approach: import directly
    try:
        import app
        print(f"📁 App module found: {dir(app)}")
    except ImportError as e2:
        print(f"❌ Cannot import app module: {e2}")