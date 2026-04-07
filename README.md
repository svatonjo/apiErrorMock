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
/errors/template/:templateName/:statusCode

Simulate 404 (any method):
- URL: http://localhost:4000/errors/404

Simulate 500 with custom message via body (e.g. POST):
- URL: http://localhost:4000/errors/500
- Body JSON: { "errorMessage": "My custom 500 error" }

Simulate 403 with custom message via query param (GET):
- URL: http://localhost:4000/errors/403?message=Access+denied+for+testing

Simulate error body from JSON template:
- Template folder: /templates
- Example template file: /templates/validation-error.json
- URL: http://localhost:4000/errors/template/validation-error/400

Simulate template with a different HTTP status via query param:
- URL: http://localhost:4000/errors/template/validation-error?statusCode=422

Simulate template and override selected values via POST body:
- URL: http://localhost:4000/errors/template/validation-error/422
- Body JSON:
```json
{
  "templateOverrides": {
    "title": "Došlo k jedné nebo více chybám ověření formularu.",
    "errors": {
      "mEJCode[0]": [
        "Toto pole je povinné"
      ],
      "checkPlaceCode[0]": [
        "Toto pole je povinné"
      ],
      "birthNumber[0]": [
        "Neplatny format"
      ]
    }
  }
}
```

