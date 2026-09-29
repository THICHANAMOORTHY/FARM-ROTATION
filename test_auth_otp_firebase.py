import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://localhost:3000"

def post(path, payload):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def test_flow():
    print("=" * 60)
    print("TESTING FORGOT PASSWORD OTP, RESEND OTP & FIREBASE AUTH")
    print("=" * 60)

    # 1. Register a test user
    email = "testfarmer@gmail.com"
    reg_status, reg_data = post("/api/auth/register", {
        "name": "Test Farmer",
        "email": email,
        "password": "Password123!",
        "phone": "9876543210"
    })
    print(f"1. User Registration: Status {reg_status}")

    # 2. Forgot Password -> Request OTP
    fp_status, fp_data = post("/api/auth/forgot-password", {"email": email})
    print(f"2. Forgot Password Request: Status {fp_status}, Data: {fp_data}")
    otp = fp_data.get("dev_otp")
    assert fp_status == 200, f"Expected 200, got {fp_status}"
    assert otp is not None, "Expected OTP in dev mode"

    # 3. Test Resend OTP Cooldown
    ro_status1, ro_data1 = post("/api/auth/resend-otp", {"email": email})
    print(f"3. Resend OTP Immediate (should hit cooldown): Status {ro_status1}, Message: {ro_data1.get('error') or ro_data1.get('message')}")
    assert ro_status1 == 429, f"Expected 429 rate limit, got {ro_status1}"

    # 4. Reset Password with incorrect OTP (should fail)
    bad_status, bad_data = post("/api/auth/reset-password", {
        "email": email,
        "otp": "000000",
        "new_password": "NewSecretPassword456!"
    })
    print(f"4. Bad OTP Check: Status {bad_status}, Message: {bad_data.get('error')}")
    assert bad_status == 400, f"Expected 400, got {bad_status}"

    # 5. Reset Password with valid OTP
    good_status, good_data = post("/api/auth/reset-password", {
        "email": email,
        "otp": otp,
        "new_password": "NewSecretPassword456!"
    })
    print(f"5. Valid OTP Reset: Status {good_status}, Message: {good_data.get('message')}")
    assert good_status == 200, f"Expected 200, got {good_status}"

    # 6. Log in with the new password
    login_status, login_data = post("/api/auth/login", {
        "email": email,
        "password": "NewSecretPassword456!"
    })
    print(f"6. Login with New Password: Status {login_status}, User: {login_data.get('user', {}).get('name')}")
    assert login_status == 200, f"Expected 200, got {login_status}"

    # 7. Firebase Email Authentication
    fb_email = "firebase.farmer@gmail.com"
    fb_status, fb_data = post("/api/auth/firebase-login", {
        "email": fb_email,
        "name": "Firebase Farmer",
        "idToken": "dummy-firebase-id-token"
    })
    print(f"7. Firebase Email Auth: Status {fb_status}, Provider: {fb_data.get('auth_provider')}, Farm ID: {fb_data.get('user', {}).get('farm_id')}")
    assert fb_status == 200, f"Expected 200, got {fb_status}"

    print("=" * 60)
    print("ALL OTP & FIREBASE AUTH TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_flow()
