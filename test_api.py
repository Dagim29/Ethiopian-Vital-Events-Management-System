#!/usr/bin/env python3
"""
Simple API test script to verify endpoints are working
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_endpoint(method, endpoint, data=None, headers=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        
        print(f"{method.upper()} {endpoint}: {response.status_code}")
        if response.status_code != 200:
            print(f"  Response: {response.text[:200]}...")
        return response
    except Exception as e:
        print(f"{method.upper()} {endpoint}: ERROR - {e}")
        return None

def main():
    print("🧪 Testing API Endpoints")
    print("=" * 50)
    
    # Test authentication endpoints
    print("\n🔐 Testing Authentication:")
    test_endpoint("POST", "/auth/login", {
        "email": "admin@vms.et",
        "password": "admin123"
    })
    
    # Test birth records endpoints
    print("\n👶 Testing Birth Records:")
    test_endpoint("GET", "/births")
    test_endpoint("GET", "/births?page=1&per_page=5")
    
    # Test death records endpoints
    print("\n💀 Testing Death Records:")
    test_endpoint("GET", "/deaths")
    
    # Test marriage records endpoints
    print("\n💒 Testing Marriage Records:")
    test_endpoint("GET", "/marriages")
    
    # Test divorce records endpoints
    print("\n💔 Testing Divorce Records:")
    test_endpoint("GET", "/divorces")
    
    # Test users endpoints
    print("\n👥 Testing Users:")
    test_endpoint("GET", "/users")
    
    print("\n✅ API testing completed!")

if __name__ == "__main__":
    main()
