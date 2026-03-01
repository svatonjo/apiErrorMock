# apiErrorMock
Purpose
- to be able to simulate error handling in FE application

Required
- node.js
- plugin to intercept/redirect API requests
-- Firefox == Request Interceptor (Vahe Demirkhanyan)
-- Chrome == ???

Installation:
- npm i

Usage
1. Start api server: npm start
  a. By default it listens on http://localhost:4000
2. Setup interceptor
  a. eg. URL Pattern: GET */login
  b. Redirect URL: http://localhost:4000/errors/404?message=Login error mock test
3. Test/Verify the error handling in the application

Some more info:

Simulate 404 (any method):
URL: http://localhost:4000/errors/404
Simulate 500 with custom message via body (e.g. POST):
URL: http://localhost:4000/errors/500
Body JSON: { "errorMessage": "My custom 500 error" }
Simulate 403 with custom message via query param (GET):
URL: http://localhost:4000/errors/403?message=Access+denied+for+testing
If you prefer specific named endpoints per error (e.g. /not-found, /forbidden-403) or need additional status codes/response fields, tell me your preferred naming and I’ll adjust the routes accordingly.