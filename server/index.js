'use strict';

var app = require('express')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var serverPort = 3200;
var mongoose = require('mongoose');
var config = require('config');
var ErrorHandler = require('./libs/error/ErrorHandler');
var Logging = require('./libs/Logging');

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

mongoose.connect(config.mongo.database_host, config.mongo.options);
mongoose.connection.on(
  'error',
  function (error) {
    Logging.logAction(Logging.logLevels.ERROR, 'MongoDB connection error', error.stack);
  }
);

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

/**
 * Initialize the Swagger middleware.
 *
 * @param {object} swaggerDoc - The swagger document object
 * @param {function} callback - The callback
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 */
swaggerTools.initializeMiddleware(swaggerDoc, function callback(middleware) {
  app.use(function useCustom(req, res, next) {
    // When we have custom headers and when certain VERBS are made, CORS will trigger
    // a preflight check that will come through as 'OPTIONS'.
    // For more info see https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
    if (req.method == 'OPTIONS') {
      var allowedHeaders = [
        'Authorization',
        'Content-Type',
        'Accept',
        'Context',
        'If-Match',
        'If-Modified-Since',
        'If-None-Match',
        'If-Unmodified-Since',
        'X-Accept-Timezone'
      ];

      var headersAsString  = allowedHeaders.join();
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', headersAsString);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader(
        'Access-Control-Expose-Headers',
        'ETag, X-Accept-Timezone, Link, X-Result-Count, Cache-Control, Expires'
      );
      res.setHeader('Access-Control-Max-Age', '1800');
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.statusCode = 204;
      res.end();
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    }
  });
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  if (process.env.NODE_ENV !== 'ci') {
      app.use(middleware.swaggerUi());
  }

  app.use(ErrorHandler.onError);

  // if the port has been explicitly passed in, use that
  if (process.argv[2]) {
    serverPort = process.argv[2];
  }

  // Start the server
  
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
      if (process.env.NODE_ENV !== 'ci') {
          console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
      }
  });
});
