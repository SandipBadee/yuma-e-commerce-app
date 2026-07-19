const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YUMA BACKEND API',
      version: '1.0.0',
      description: 'API documentation for the YUMA E-commerce platform',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste JWT token from /api/auth/login as: Bearer <token>.',
        },
        basicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Use email as username and password as password for protected routes that support Basic auth.',
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};