const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const templatesDirectory = path.join(__dirname, 'templates');

app.use(cors());
app.use(express.json());

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const deepMerge = (target, source) => {
  if (!isPlainObject(source)) {
    return target;
  }

  const output = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMerge(output[key], value);
      continue;
    }

    output[key] = value;
  }

  return output;
};

const isValidHttpStatusCode = (value) => {
  const numericValue = Number(value);

  return Number.isInteger(numericValue) && numericValue >= 100 && numericValue <= 599;
};

const getAvailableTemplates = () => {
  if (!fs.existsSync(templatesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(templatesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.basename(entry.name, '.json'))
    .sort();
};

const loadTemplate = (templateName) => {
  if (!/^[a-zA-Z0-9_-]+$/.test(templateName)) {
    const error = new Error('Invalid template name');
    error.code = 'INVALID_TEMPLATE_NAME';
    throw error;
  }

  const templatePath = path.join(templatesDirectory, `${templateName}.json`);

  if (!fs.existsSync(templatePath)) {
    const error = new Error(`Template not found: ${templateName}`);
    error.code = 'TEMPLATE_NOT_FOUND';
    throw error;
  }

  try {
    return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  } catch (parseError) {
    const error = new Error(`Invalid JSON in template: ${templateName}`);
    error.code = 'INVALID_TEMPLATE_JSON';
    throw error;
  }
};

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
    templateBaseUrl: '/errors/template/:templateName/:statusCode',
    supportedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    supportedStatusCodes: Object.keys(errorDefinitions),
    availableTemplates: getAvailableTemplates(),
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
      },
      {
        method: 'GET',
        url: '/errors/template/validation-error/400'
      },
      {
        method: 'POST',
        url: '/errors/template/validation-error/422',
        body: {
          templateOverrides: {
            title: 'Došlo k vlastni validacni chybe'
          }
        }
      }
    ]
  });
});

app.all(['/errors/template/:templateName', '/errors/template/:templateName/:statusCode'], (req, res) => {
  const { templateName, statusCode: routeStatusCode } = req.params;
  const requestedStatusCode = routeStatusCode || req.body?.statusCode || req.query.statusCode || '400';

  if (!isValidHttpStatusCode(requestedStatusCode)) {
    return res.status(400).json({
      errorCode: 400,
      errorName: 'Bad Request',
      errorMessage: `Unsupported HTTP status code: ${requestedStatusCode}`
    });
  }

  try {
    const templatePayload = loadTemplate(templateName);
    const templateOverrides = isPlainObject(req.body?.templateOverrides)
      ? req.body.templateOverrides
      : null;

    const responsePayload = templateOverrides
      ? deepMerge(templatePayload, templateOverrides)
      : templatePayload;

    return res.status(Number(requestedStatusCode)).json(responsePayload);
  } catch (error) {
    if (error.code === 'INVALID_TEMPLATE_NAME') {
      return res.status(400).json({
        errorCode: 400,
        errorName: 'Bad Request',
        errorMessage: 'Template name can only contain letters, numbers, dash and underscore'
      });
    }

    if (error.code === 'TEMPLATE_NOT_FOUND') {
      return res.status(404).json({
        errorCode: 404,
        errorName: 'Not Found',
        errorMessage: `Template not found: ${templateName}`,
        availableTemplates: getAvailableTemplates()
      });
    }

    if (error.code === 'INVALID_TEMPLATE_JSON') {
      return res.status(500).json({
        errorCode: 500,
        errorName: 'Internal Server Error',
        errorMessage: `Template contains invalid JSON: ${templateName}`
      });
    }

    return res.status(500).json({
      errorCode: 500,
      errorName: 'Internal Server Error',
      errorMessage: 'Unexpected template processing error'
    });
  }
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
