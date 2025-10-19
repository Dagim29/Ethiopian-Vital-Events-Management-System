from pymongo import MongoClient

try:
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    
    # Test connection
    client.admin.command('ping')
    print("✅ MongoDB is running and accessible!")
    
    # Create our database
    db = client['ethiopian_vital_management']
    
    # Create collections
    collections = ['users', 'birth_records', 'death_records', 'marriage_records', 'divorce_records']
    for collection_name in collections:
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
            print(f"✅ Created collection: {collection_name}")
        else:
            print(f"✅ Collection already exists: {collection_name}")
    
    # Create admin user directly
    import bcrypt
    
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
            'is_active': True
        }
        
        result = db.users.insert_one(admin_data)
        print("✅ Admin user created successfully!")
        print(f"   User ID: {result.inserted_id}")
    else:
        print("✅ Admin user already exists!")
    
    print("\n🎉 MongoDB setup completed successfully!")
    print("📊 Database: ethiopian_vital_management")
    print("📁 Collections created: users, birth_records, death_records, marriage_records, divorce_records")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n🔧 Please make sure MongoDB is running:")
    print("   - Open MongoDB Compass and check connection")
    print("   - Or run: mongod --dbpath C:\\data\\db")