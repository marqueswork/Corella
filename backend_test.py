#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Corella Agenda SaaS
Tests all backend APIs with proper authentication and error handling.
"""

import requests
import json
from datetime import datetime, timedelta
import sys

# Configuration from review request
BASE_URL = "https://corella-business.preview.emergentagent.com/api"
SESSION_TOKEN = "test_session_1766147988063"
BUSINESS_ID = "biz_5820cd225993"
SERVICE_ID = "svc_f3b3be470314"
CLIENT_ID = "client_fa0c31acf226"
STAFF_ID = "staff_720de6dfa5ec"

# Headers for authenticated requests
AUTH_HEADERS = {
    "Authorization": f"Bearer {SESSION_TOKEN}",
    "Content-Type": "application/json"
}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def log_success(self, test_name):
        print(f"✅ {test_name}")
        self.passed += 1
    
    def log_failure(self, test_name, error):
        print(f"❌ {test_name}: {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")
        return self.failed == 0

def make_request(method, url, headers=None, json_data=None, params=None):
    """Helper function to make HTTP requests with error handling."""
    try:
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=json_data,
            params=params,
            timeout=30
        )
        return response
    except requests.exceptions.RequestException as e:
        return None, str(e)

def test_auth_api(results):
    """Test Authentication API endpoints."""
    print("\n🔐 Testing Auth API...")
    
    # Test 1: GET /api/auth/me with valid token
    response = make_request("GET", f"{BASE_URL}/auth/me", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        data = response.json()
        if "user_id" in data and "email" in data:
            results.log_success("Auth /me with valid token")
        else:
            results.log_failure("Auth /me with valid token", "Missing required fields in response")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Auth /me with valid token", f"Status: {status}")
    
    # Test 2: GET /api/auth/me without token (should 401)
    response = make_request("GET", f"{BASE_URL}/auth/me")
    if response and response.status_code == 401:
        results.log_success("Auth /me without token returns 401")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Auth /me without token returns 401", f"Expected 401, got: {status}")
    
    # Test 3: POST /api/auth/logout
    response = make_request("POST", f"{BASE_URL}/auth/logout", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        results.log_success("Auth logout")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Auth logout", f"Status: {status}")

def test_business_api(results):
    """Test Business CRUD operations."""
    print("\n🏢 Testing Business API...")
    
    # Test 1: GET /api/agenda/businesses (list user's businesses)
    response = make_request("GET", f"{BASE_URL}/agenda/businesses", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        businesses = response.json()
        if isinstance(businesses, list):
            results.log_success("List businesses")
        else:
            results.log_failure("List businesses", "Response is not a list")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("List businesses", f"Status: {status}")
    
    # Test 2: GET /api/agenda/businesses/{id}
    response = make_request("GET", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        business = response.json()
        if "business_id" in business and business["business_id"] == BUSINESS_ID:
            results.log_success("Get business by ID")
        else:
            results.log_failure("Get business by ID", "Business ID mismatch or missing")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Get business by ID", f"Status: {status}")
    
    # Test 3: POST /api/agenda/businesses (create new business with unique slug)
    new_business_data = {
        "name": "Test Salon API",
        "slug": f"test-salon-api-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timezone": "America/New_York"
    }
    response = make_request("POST", f"{BASE_URL}/agenda/businesses", headers=AUTH_HEADERS, json_data=new_business_data)
    if response and response.status_code == 200:
        business = response.json()
        if "business_id" in business and business["name"] == new_business_data["name"]:
            results.log_success("Create new business")
            # Store for cleanup if needed
            global NEW_BUSINESS_ID
            NEW_BUSINESS_ID = business["business_id"]
        else:
            results.log_failure("Create new business", "Missing business_id or name mismatch")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Create new business", f"Status: {status}")
    
    # Test 4: PUT /api/agenda/businesses/{id} (update name, working_hours)
    update_data = {
        "name": "Updated Test Salon",
        "working_hours": {
            "monday": {"start": "08:00", "end": "17:00", "enabled": True},
            "tuesday": {"start": "08:00", "end": "17:00", "enabled": True},
            "wednesday": {"start": "08:00", "end": "17:00", "enabled": True},
            "thursday": {"start": "08:00", "end": "17:00", "enabled": True},
            "friday": {"start": "08:00", "end": "17:00", "enabled": True},
            "saturday": {"start": "09:00", "end": "14:00", "enabled": True},
            "sunday": {"start": "00:00", "end": "00:00", "enabled": False}
        }
    }
    response = make_request("PUT", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}", headers=AUTH_HEADERS, json_data=update_data)
    if response and response.status_code == 200:
        results.log_success("Update business")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Update business", f"Status: {status}")

def test_client_api(results):
    """Test Client CRUD operations."""
    print("\n👥 Testing Client API...")
    
    # Test 1: GET /api/agenda/businesses/{id}/clients
    response = make_request("GET", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/clients", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        clients = response.json()
        if isinstance(clients, list):
            results.log_success("List clients")
        else:
            results.log_failure("List clients", "Response is not a list")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("List clients", f"Status: {status}")
    
    # Test 2: POST /api/agenda/businesses/{id}/clients
    new_client_data = {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "phone": "+1-555-0123",
        "notes": "Regular customer, prefers morning appointments"
    }
    response = make_request("POST", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/clients", headers=AUTH_HEADERS, json_data=new_client_data)
    if response and response.status_code == 200:
        client = response.json()
        if "client_id" in client and client["name"] == new_client_data["name"]:
            results.log_success("Create new client")
            global NEW_CLIENT_ID
            NEW_CLIENT_ID = client["client_id"]
        else:
            results.log_failure("Create new client", "Missing client_id or name mismatch")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Create new client", f"Status: {status}")
    
    # Test 3: PUT /api/agenda/businesses/{id}/clients/{client_id}
    update_client_data = {
        "name": "Sarah Johnson-Smith",
        "phone": "+1-555-0124",
        "notes": "Updated contact info"
    }
    response = make_request("PUT", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/clients/{CLIENT_ID}", headers=AUTH_HEADERS, json_data=update_client_data)
    if response and response.status_code == 200:
        results.log_success("Update client")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Update client", f"Status: {status}")
    
    # Test 4: GET /api/agenda/businesses/{id}/clients/{client_id}/history
    response = make_request("GET", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/clients/{CLIENT_ID}/history", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        history = response.json()
        if isinstance(history, list):
            results.log_success("Get client history")
        else:
            results.log_failure("Get client history", "Response is not a list")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Get client history", f"Status: {status}")
    
    # Test 5: DELETE /api/agenda/businesses/{id}/clients/{client_id} (if we created a new one)
    if 'NEW_CLIENT_ID' in globals():
        response = make_request("DELETE", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/clients/{NEW_CLIENT_ID}", headers=AUTH_HEADERS)
        if response and response.status_code == 200:
            results.log_success("Delete client")
        else:
            status = response.status_code if response else "Connection Error"
            results.log_failure("Delete client", f"Status: {status}")

def test_service_api(results):
    """Test Service CRUD operations."""
    print("\n💼 Testing Service API...")
    
    # Test 1: GET /api/agenda/businesses/{id}/services
    response = make_request("GET", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/services", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        services = response.json()
        if isinstance(services, list):
            results.log_success("List services")
        else:
            results.log_failure("List services", "Response is not a list")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("List services", f"Status: {status}")
    
    # Test 2: POST /api/agenda/businesses/{id}/services
    new_service_data = {
        "name": "Deep Conditioning Treatment",
        "duration": 45,
        "price": 75.00,
        "description": "Intensive hair treatment for damaged hair"
    }
    response = make_request("POST", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/services", headers=AUTH_HEADERS, json_data=new_service_data)
    if response and response.status_code == 200:
        service = response.json()
        if "service_id" in service and service["name"] == new_service_data["name"]:
            results.log_success("Create new service")
            global NEW_SERVICE_ID
            NEW_SERVICE_ID = service["service_id"]
        else:
            results.log_failure("Create new service", "Missing service_id or name mismatch")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Create new service", f"Status: {status}")
    
    # Test 3: PUT /api/agenda/businesses/{id}/services/{service_id} (toggle is_active)
    update_service_data = {
        "is_active": False
    }
    response = make_request("PUT", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/services/{SERVICE_ID}", headers=AUTH_HEADERS, json_data=update_service_data)
    if response and response.status_code == 200:
        results.log_success("Update service (toggle active)")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Update service (toggle active)", f"Status: {status}")
    
    # Reactivate the service for other tests
    reactivate_data = {"is_active": True}
    make_request("PUT", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/services/{SERVICE_ID}", headers=AUTH_HEADERS, json_data=reactivate_data)

def test_appointment_api(results):
    """Test Appointment CRUD operations."""
    print("\n📅 Testing Appointment API...")
    
    # Test 1: GET /api/agenda/businesses/{id}/appointments
    response = make_request("GET", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        appointments = response.json()
        if isinstance(appointments, list):
            results.log_success("List appointments")
        else:
            results.log_failure("List appointments", "Response is not a list")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("List appointments", f"Status: {status}")
    
    # Test 2: POST /api/agenda/businesses/{id}/appointments (test double-booking prevention)
    future_time = datetime.now() + timedelta(days=2, hours=10)  # 2 days from now at 10 AM
    new_appointment_data = {
        "client_id": CLIENT_ID,
        "service_id": SERVICE_ID,
        "staff_id": STAFF_ID,
        "start_time": future_time.isoformat(),
        "notes": "Test appointment for API testing"
    }
    response = make_request("POST", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments", headers=AUTH_HEADERS, json_data=new_appointment_data)
    if response and response.status_code == 200:
        appointment = response.json()
        if "appointment_id" in appointment:
            results.log_success("Create new appointment")
            global NEW_APPOINTMENT_ID
            NEW_APPOINTMENT_ID = appointment["appointment_id"]
        else:
            results.log_failure("Create new appointment", "Missing appointment_id")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Create new appointment", f"Status: {status}")
    
    # Test 3: Test double-booking prevention (try to book same time slot)
    if 'NEW_APPOINTMENT_ID' in globals():
        duplicate_appointment_data = {
            "client_id": CLIENT_ID,
            "service_id": SERVICE_ID,
            "staff_id": STAFF_ID,
            "start_time": future_time.isoformat(),
            "notes": "This should fail due to double booking"
        }
        response = make_request("POST", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments", headers=AUTH_HEADERS, json_data=duplicate_appointment_data)
        if response and response.status_code == 400:
            results.log_success("Double-booking prevention works")
        else:
            status = response.status_code if response else "Connection Error"
            results.log_failure("Double-booking prevention works", f"Expected 400, got: {status}")
    
    # Test 4: PUT /api/agenda/businesses/{id}/appointments/{apt_id} (update status)
    if 'NEW_APPOINTMENT_ID' in globals():
        update_appointment_data = {
            "status": "completed",
            "notes": "Appointment completed successfully"
        }
        response = make_request("PUT", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments/{NEW_APPOINTMENT_ID}", headers=AUTH_HEADERS, json_data=update_appointment_data)
        if response and response.status_code == 200:
            results.log_success("Update appointment status")
        else:
            status = response.status_code if response else "Connection Error"
            results.log_failure("Update appointment status", f"Status: {status}")
    
    # Test 5: DELETE /api/agenda/businesses/{id}/appointments/{apt_id} (cancel)
    if 'NEW_APPOINTMENT_ID' in globals():
        response = make_request("DELETE", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/appointments/{NEW_APPOINTMENT_ID}", headers=AUTH_HEADERS)
        if response and response.status_code == 200:
            results.log_success("Cancel appointment")
        else:
            status = response.status_code if response else "Connection Error"
            results.log_failure("Cancel appointment", f"Status: {status}")

def test_dashboard_api(results):
    """Test Dashboard API."""
    print("\n📊 Testing Dashboard API...")
    
    # Test: GET /api/agenda/businesses/{id}/dashboard
    response = make_request("GET", f"{BASE_URL}/agenda/businesses/{BUSINESS_ID}/dashboard", headers=AUTH_HEADERS)
    if response and response.status_code == 200:
        dashboard = response.json()
        if "stats" in dashboard and "today_appointments" in dashboard and "upcoming_appointments" in dashboard:
            results.log_success("Get dashboard stats")
        else:
            results.log_failure("Get dashboard stats", "Missing required dashboard fields")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Get dashboard stats", f"Status: {status}")

def test_public_booking_api(results):
    """Test Public Booking API (no auth required)."""
    print("\n🌐 Testing Public Booking API...")
    
    # Test 1: GET /api/agenda/public/test-salon
    response = make_request("GET", f"{BASE_URL}/agenda/public/test-salon")
    if response and response.status_code == 200:
        public_data = response.json()
        if "business" in public_data and "services" in public_data and "staff" in public_data:
            results.log_success("Get public business info")
        else:
            results.log_failure("Get public business info", "Missing required fields")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Get public business info", f"Status: {status}")
    
    # Test 2: GET /api/agenda/public/test-salon/available-slots
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    params = {
        "staff_id": STAFF_ID,
        "service_id": SERVICE_ID,
        "date": tomorrow
    }
    response = make_request("GET", f"{BASE_URL}/agenda/public/test-salon/available-slots", params=params)
    if response and response.status_code == 200:
        slots_data = response.json()
        if "slots" in slots_data and isinstance(slots_data["slots"], list):
            results.log_success("Get available slots")
        else:
            results.log_failure("Get available slots", "Missing or invalid slots field")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Get available slots", f"Status: {status}")
    
    # Test 3: POST /api/agenda/public/test-salon/book
    future_booking_time = datetime.now() + timedelta(days=3, hours=14)  # 3 days from now at 2 PM
    booking_data = {
        "client_name": "Emma Wilson",
        "client_email": "emma.wilson@example.com",
        "client_phone": "+1-555-0199",
        "service_id": SERVICE_ID,
        "staff_id": STAFF_ID,
        "start_time": future_booking_time.isoformat()
    }
    response = make_request("POST", f"{BASE_URL}/agenda/public/test-salon/book", json_data=booking_data)
    if response and response.status_code == 200:
        booking_result = response.json()
        if "appointment_id" in booking_result and "message" in booking_result:
            results.log_success("Create public booking")
        else:
            results.log_failure("Create public booking", "Missing appointment_id or message")
    else:
        status = response.status_code if response else "Connection Error"
        results.log_failure("Create public booking", f"Status: {status}")

def main():
    """Run all backend API tests."""
    print("🚀 Starting Corella Agenda Backend API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Session Token: {SESSION_TOKEN}")
    
    results = TestResults()
    
    # Run all test suites
    test_auth_api(results)
    test_business_api(results)
    test_client_api(results)
    test_service_api(results)
    test_appointment_api(results)
    test_dashboard_api(results)
    test_public_booking_api(results)
    
    # Print final summary
    success = results.summary()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()