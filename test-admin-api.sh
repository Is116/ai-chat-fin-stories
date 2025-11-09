#!/bin/bash

# Test admin login and users endpoint

echo "1. Testing admin login..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Response: $TOKEN_RESPONSE"

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo -e "\n2. Token extracted: $TOKEN"

echo -e "\n3. Testing /api/admin/users endpoint..."
curl -s -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo -e "\nDone!"
