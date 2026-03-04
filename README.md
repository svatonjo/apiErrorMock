# apiErrorMock
Purpose
- to be able to simulate error handling in FE application

Required
- node.js
- plugin to intercept/redirect API requests
  - Firefox == Request Interceptor (Vahe Demirkhanyan)
  - Chrome == ???

Installation:
- npm i

Usage
1. Start api server: npm start
  - By default it listens on http://localhost:4000
3. Setup interceptor
- eg. URL Pattern: GET */login
- Redirect URL: http://localhost:4000/errors/404?message=Login error mock test
4. Test/Verify the error handling in the application

Some more info:

EPs:
/errors/:statusCode
/PD/applications/:statusCode

Simulate 404 (any method):
- URL: http://localhost:4000/errors/404

Simulate 500 with custom message via body (e.g. POST):
- URL: http://localhost:4000/errors/500
- Body JSON: { "errorMessage": "My custom 500 error" }

Simulate 403 with custom message via query param (GET):
- URL: http://localhost:4000/errors/403?message=Access+denied+for+testing

Added extra PD EP
Usage Example: Redirect to: http://localhost:4000/PD/applications/404?errorType=Osoba nebyla dohledána&errorTitle=TEST_Osoba_nenalezena&origType=OSOBA_NENALEZENA&origDesc=TEST_Osoba nenalezena 
