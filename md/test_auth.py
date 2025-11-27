#!/usr/bin/env python3
"""
Test authentication flow
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_login():
    """Test login and get token"""
    print("🔐 Testing Login...")
    
    login_data = {
        "email": "admin@vms.et",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Login Response: {json.dumps(data, indent=2)}")
            
            # Extract token
            token = data.get('access_token')
            if token:
                print(f"✅ Token received: {token[:20]}...")
                return token
            else:
                print("❌ No access_token in response")
                return None
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_authenticated_request(token):
    """Test authenticated request"""
    print("\n🔒 Testing Authenticated Request...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/births", headers=headers)
        print(f"Birth Records Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Birth Records: {len(data.get('data', {}).get('birth_records', []))} records")
        else:
            print(f"❌ Birth Records failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Birth Records error: {e}")

def main():
    print("🧪 Testing Authentication Flow")
    print("=" * 50)
    
    # Test login
    token = test_login()
    
    if token:
        # Test authenticated request
        test_authenticated_request(token)
    else:
        print("❌ Cannot test authenticated requests without token")

if __name__ == "__main__":
    main()
