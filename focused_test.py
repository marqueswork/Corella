#!/usr/bin/env python3
"""
Focused test for the two scenarios that showed connection errors
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "https://corella-business.preview.emergentagent.com/api"
SESSION_TOKEN = "test_session_1766147988063"
BUSINESS_ID = "biz_5820cd225993"
SERVICE_ID = "svc_f3b3be470314"
CLIENT_ID = "client_fa0c31acf226"
STAFF_ID = "staff_720de6dfa5ec"

AUTH_HEADERS = {
    "Authorization": f"Bearer {SESSION_TOKEN}",
    "Content-Type": "application/json"
}

def test_auth_without_token():
    """Test auth endpoint without token"""
    print("Testing /api/auth/me without token...")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 401:
            print("✅ Auth correctly returns 401 without token")
            return True
        else:
            print(f"❌ Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_double_booking():
    """Test double booking prevention"""
    print("\nTesting double booking prevention...")
    
    # First, create an appointment
    future_time = datetime.now() + timedelta(days=1, hours=15)  # Tomorrow at 3 PM
    appointment_data = {
        "client_id": CLIENT_ID,
        "service_id": SERVICE_ID,
        "staff_id": STAFF_ID,
        "start_time": future_time.isoformat(),
        "notes": "First appointment"
    }
    
    try:
        # Create first appointment
        response1 = requests.post(
            f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments",
            headers=AUTH_HEADERS,
            json=appointment_data,
            timeout=10
        )
        print(f"First appointment status: {response1.status_code}")
        
        if response1.status_code == 200:
            appointment_id = response1.json().get("appointment_id")
            print(f"Created appointment: {appointment_id}")
            
            # Try to create conflicting appointment
            conflicting_data = {
                "client_id": CLIENT_ID,
                "service_id": SERVICE_ID,
                "staff_id": STAFF_ID,
                "start_time": future_time.isoformat(),
                "notes": "Conflicting appointment"
            }
            
            response2 = requests.post(
                f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments",
                headers=AUTH_HEADERS,
                json=conflicting_data,
                timeout=10
            )
            print(f"Conflicting appointment status: {response2.status_code}")
            
            # Clean up - cancel the first appointment
            requests.delete(
                f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments/{appointment_id}",
                headers=AUTH_HEADERS,
                timeout=10
            )
            
            if response2.status_code == 400:
                print("✅ Double booking prevention works correctly")
                return True
            else:
                print(f"❌ Expected 400, got {response2.status_code}")
                return False
        else:
            print(f"❌ Failed to create first appointment: {response1.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Running focused tests for previously failed scenarios\n")
    
    test1_result = test_auth_without_token()
    test2_result = test_double_booking()
    
    print(f"\n📊 Results:")
    print(f"Auth without token: {'✅ PASS' if test1_result else '❌ FAIL'}")
    print(f"Double booking prevention: {'✅ PASS' if test2_result else '❌ FAIL'}")
    
    if test1_result and test2_result:
        print("\n🎉 All focused tests passed!")
    else:
        print("\n⚠️  Some tests still failing")