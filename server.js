const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Central definition of supported simulated errors
const errorDefinitions = {
  '400': { name: 'Bad Request', message: 'Simulated 400 Bad Request error' },
  '401': { name: 'Unauthorized', message: 'Simulated 401 Unauthorized error' },
  '403': { name: 'Forbidden', message: 'Simulated 403 Forbidden error' },
  '404': { name: 'Not Found', message: 'Simulated 404 Not Found error' },
  '409': { name: 'Conflict', message: 'Simulated 409 Conflict error' },
  '422': { name: 'Unprocessable Entity', message: 'Simulated 422 Unprocessable Entity error' },
  '500': { name: 'Internal Server Error', message: 'Simulated 500 Internal Server Error' },
  '502': { name: 'Bad Gateway', message: 'Simulated 502 Bad Gateway error' },
  '503': { name: 'Service Unavailable', message: 'Simulated 503 Service Unavailable error' }
};

// Root endpoint describing how to use the API
app.get('/', (req, res) => {
  res.json({
    name: 'Local Error Simulation API',
    description: 'Simulate HTTP error responses for frontend testing.',
    baseUrl: `/errors/:statusCode`,
    supportedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    supportedStatusCodes: Object.keys(errorDefinitions),
    usageExamples: [
      {
        method: 'GET',
        url: '/errors/404'
      },
      {
        method: 'POST',
        url: '/errors/500',
        body: { errorMessage: 'Custom 500 message from body' }
      },
      {
        method: 'GET',
        url: '/errors/403?message=Override+via+query+param'
      }
    ]
  });
});

// Generic route to simulate errors by status code
app.all('/errors/:statusCode', (req, res) => {
  const { statusCode } = req.params;
  const def = errorDefinitions[statusCode];

  if (!def) {
    return res.status(400).json({
      errorCode: 400,
      errorName: 'Bad Request',
      errorMessage: `Unsupported simulated status code: ${statusCode}`
    });
  }

  // Allow overriding the default message via body or query param
  const customMessage =
    (req.body && req.body.errorMessage) ||
    req.query.message ||
    def.message;

  res.status(Number(statusCode)).json({
    errorCode: Number(statusCode),
    errorName: def.name,
    errorMessage: customMessage,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Error simulation API is running on http://localhost:${PORT}`);
});
