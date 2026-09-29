# test_chatbot_suite.py
import urllib.request
import json
import sys
import time

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:3000/api/chat'

test_cases = [
    ('Hello', 'en', 'Greeting & Orientation'),
    ('What is my farm soil health status?', 'en', 'Soil Health Diagnostic'),
    ('Why did tomato get penalized?', 'en', 'Monoculture & Disease Risk'),
    ('What crop should I rotate to?', 'en', 'Crop Recommendation & Rotation'),
    ('How much fertilizer and manure do I need?', 'en', 'Targeted Nutrition & Dosage'),
    ('What are the mandi prices and profit for green gram vs tomato?', 'en', 'Market Intelligence & APMC Quotes'),
    ('வணக்கம்', 'ta', 'Tamil Greeting'),
    ('அடுத்த பயிர் என்ன நடலாம்?', 'ta', 'Tamil Crop Rotation'),
    ('மண் பரிசோதனை அறிக்கை காட்டு', 'ta', 'Tamil Soil Health Analysis'),
    ('என் நிலத்திற்கு என்ன உரம் போட வேண்டும்?', 'ta', 'Tamil Fertilizer Dosage'),
    ('வானிலை எப்படி உள்ளது?', 'ta', 'Tamil Weather & Spray Advisory')
]

print('=' * 75)
print('  🌱 UZHAVU KAAPPAAN — Comprehensive Chatbot Verification & Review')
print('=' * 75)

passed = 0
for idx, (msg, lang, label) in enumerate(test_cases, 1):
    t0 = time.time()
    req = urllib.request.Request(
        BASE,
        data=json.dumps({'message': msg, 'farm_id': 101, 'lang': lang}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            elapsed = time.time() - t0
            data = json.loads(res.read().decode('utf-8'))
            reply = data.get('reply', '')
            suggestions = data.get('suggestions', [])
            provider = data.get('provider', 'Agronomic Engine')
            
            has_reply = len(reply.strip()) > 30
            has_suggestions = len(suggestions) >= 2
            
            status = 'PASS' if (has_reply and has_suggestions) else 'WARN'
            if status == 'PASS':
                passed += 1
            
            print(f'\n[{status}] Case #{idx}: {label}')
            print(f'     Query: "{msg}" ({lang}) | Latency: {elapsed:.2f}s | Provider: {provider}')
            preview = reply.replace('\n', ' ')[:100].strip()
            print(f'     Answer: {preview}...')
            print(f'     Suggested Chips ({len(suggestions)}): {suggestions}')
    except Exception as e:
        print(f'\n[FAIL] Case #{idx}: {label} -> Error: {e}')

print('\n' + '=' * 75)
print(f'  FINAL RESULT: {passed}/{len(test_cases)} Tests Passed ({(passed/len(test_cases))*100:.1f}% Reliability)')
print('=' * 75)
