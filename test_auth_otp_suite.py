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

def run_auth_checks():
    print("=" * 60)
    print("UZHAVU KAAPPAAN - Auth & Password Reset OTP Verification")
    print("=" * 60)

    # 1. User Registration
    test_user = "thichu683@gmail.com"
    r_status, r_data = post("/api/auth/register", {
        "name": "Thichan",
        "email": test_user,
        "password": "InitialPassword123!",
        "phone": "9876543210"
    })
    print(f"[1] Register User ({test_user}): HTTP {r_status} -> {r_data.get('message', r_data.get('error'))}")
    assert r_status in (200, 201, 409), f"Unexpected register status: {r_status}"

    # 2. Forgot Password Request via Resend
    fp_status, fp_data = post("/api/auth/forgot-password", {"email": test_user})
    print(f"[2] Forgot Password OTP Request: HTTP {fp_status} -> {fp_data.get('message', fp_data.get('error'))}")
    assert fp_status == 200, f"Expected 200, got {fp_status}"
    assert "dev_otp" not in fp_data, "OTP must not be exposed in client response"

    # 3. Test Cooldown protection (immediate resend should be rate limited)
    ro_status, ro_data = post("/api/auth/resend-otp", {"email": test_user})
    print(f"[3] Immediate Resend (Cooldown Test): HTTP {ro_status} -> {ro_data.get('error', ro_data.get('message'))}")
    assert ro_status == 429, f"Expected 429 rate limit, got {ro_status}"

    # 4. Test Domain Restriction Error for non-verified recipient on Resend Free-tier
    other_user = "lokesh2005c@gmail.com"
    oth_status, oth_data = post("/api/auth/forgot-password", {"email": other_user})
    print(f"[4] Non-verified Recipient Check: HTTP {oth_status} -> {oth_data.get('error', oth_data.get('message'))}")
    assert oth_status == 400, f"Expected 400 domain restriction, got {oth_status}"
    assert "Resend" in oth_data.get("error", "") or "registered email" in oth_data.get("error", ""), "Error message should clearly state Resend free tier restriction"

    # 5. Invalid OTP rejection
    bad_status, bad_data = post("/api/auth/reset-password", {
        "email": test_user,
        "otp": "000000",
        "new_password": "UpdatedPassword456!"
    })
    print(f"[5] Invalid OTP Check: HTTP {bad_status} -> {bad_data.get('error')}")
    assert bad_status == 400, f"Expected 400, got {bad_status}"

    print("=" * 60)
    print("ALL AUTH & OTP DELIVERY CHECKS PASSED (5/5)!")
    print("=" * 60)

if __name__ == "__main__":
    run_auth_checks()
