#!/usr/bin/env python3
"""
Test the complete authentication and data flow
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_complete_flow():
    """Test login and then fetch all record types"""
    print("🧪 Testing Complete Authentication Flow")
    print("=" * 60)
    
    # Step 1: Login
    print("\n1️⃣ Testing Login...")
    login_data = {
        "email": "admin@vms.et",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"   Login Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ Login failed: {response.text}")
            return False
            
        data = response.json()
        token = data.get('access_token')
        print(f"   ✅ Login successful! Token: {token[:20]}...")
        
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return False
    
    # Step 2: Test authenticated requests
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    endpoints = [
        ('/births', 'Birth Records'),
        ('/deaths', 'Death Records'),
        ('/marriages', 'Marriage Records'),
        ('/divorces', 'Divorce Records'),
        ('/users', 'Users')
    ]
    
    print(f"\n2️⃣ Testing Authenticated Endpoints...")
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            print(f"   {name}: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if 'birth_records' in data:
                    print(f"      ✅ {len(data['birth_records'])} birth records")
                elif 'death_records' in data:
                    print(f"      ✅ {len(data['death_records'])} death records")
                elif 'marriage_records' in data:
                    print(f"      ✅ {len(data['marriage_records'])} marriage records")
                elif 'divorce_records' in data:
                    print(f"      ✅ {len(data['divorce_records'])} divorce records")
                elif 'users' in data:
                    print(f"      ✅ {len(data['users'])} users")
            else:
                print(f"      ❌ Failed: {response.text[:100]}")
                
        except Exception as e:
            print(f"   ❌ {name} error: {e}")
    
    print(f"\n✅ Complete flow test finished!")
    return True

if __name__ == "__main__":
    test_complete_flow()
