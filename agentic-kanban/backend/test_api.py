#!/usr/bin/env python3
"""
Test script for the Agentic Kanban Backend API
Run this after starting the backend server to test all endpoints
"""

import requests
import json
from datetime import datetime, timezone
import time

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the root endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print("✓ Health check passed\n")
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}\n")
        return False

def test_put_cards():
    """Test adding cards to the database"""
    print("Testing PUT /api/cards...")
    
    # Sample card data
    cards_data = {
        "cards": [
            {
                "id": "test-card-1",
                "title": "Test Task 1",
                "description": "This is a test task for the kanban board",
                "status": "planned",
                "order": 1,
                "tags": ["test", "backend"],
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "test-card-2",
                "title": "Test Task 2",
                "description": "Another test task for testing purposes",
                "status": "in-progress",
                "order": 2,
                "tags": ["test", "frontend"],
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/cards",
            json=cards_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✓ PUT cards passed\n")
            return True
        else:
            print("✗ PUT cards failed\n")
            return False
    except Exception as e:
        print(f"✗ PUT cards failed: {e}\n")
        return False

def test_get_cards():
    """Test retrieving all cards"""
    print("Testing GET /api/cards...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/cards")
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200 and result.get("success"):
            print(f"✓ GET cards passed - Retrieved {len(result.get('data', []))} cards\n")
            return True
        else:
            print("✗ GET cards failed\n")
            return False
    except Exception as e:
        print(f"✗ GET cards failed: {e}\n")
        return False

def test_get_single_card():
    """Test retrieving a single card by ID"""
    print("Testing GET /api/cards/{card_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/cards/test-card-1")
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200 and result.get("success"):
            print("✓ GET single card passed\n")
            return True
        else:
            print("✗ GET single card failed\n")
            return False
    except Exception as e:
        print(f"✗ GET single card failed: {e}\n")
        return False

def test_update_card():
    """Test updating a card"""
    print("Testing PUT /api/cards/{card_id}...")
    
    update_data = {
        "status": "done",
        "completedAt": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/api/cards/test-card-1",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200 and result.get("success"):
            print("✓ UPDATE card passed\n")
            return True
        else:
            print("✗ UPDATE card failed\n")
            return False
    except Exception as e:
        print(f"✗ UPDATE card failed: {e}\n")
        return False

def test_delete_card():
    """Test deleting a card"""
    print("Testing DELETE /api/cards/{card_id}...")
    
    try:
        response = requests.delete(f"{BASE_URL}/api/cards/test-card-2")
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200:
            print("✓ DELETE card passed\n")
            return True
        else:
            print("✗ DELETE card failed\n")
            return False
    except Exception as e:
        print(f"✗ DELETE card failed: {e}\n")
        return False

def run_all_tests():
    """Run all API tests"""
    print("🚀 Starting Agentic Kanban Backend API Tests\n")
    print("=" * 50)
    
    tests = [
        test_health_check,
        test_put_cards,
        test_get_cards,
        test_get_single_card,
        test_update_card,
        test_delete_card
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The backend is working correctly.")
    else:
        print("❌ Some tests failed. Check the backend logs for issues.")
    
    return passed == total

if __name__ == "__main__":
    # Check if server is running
    try:
        requests.get(f"{BASE_URL}/", timeout=5)
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the backend server.")
        print("Make sure the server is running on http://localhost:8000")
        print("Run: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")
