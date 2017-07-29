var stt = require('swagger-test-templates');
var yaml = require('js-yaml');
var fs   = require('fs');
var reffedSwagger, swagger;
var path = "./tests/endpoint/"
var deref = require('json-schema-deref');

var config = {
  assertionFormat: 'should',
  testModule: 'supertest',
  pathName: [],
//  loadTest: [{pathName:'/user', operation:'get', load:{requests: 1000, concurrent: 100}}, { /* ... */ }],
  maxLen: 80
};

// Get document, or throw exception on error
try {
  reffedSwagger = yaml.safeLoad(fs.readFileSync('./api/swagger.yaml', 'utf8'));
} catch (e) {
  console.log(e);
  return;
}

// Temporary DeRef the JSON references, until https://github.com/apigee-127/swagger-test-templates/issues/92 is resolved
deref(reffedSwagger, function(err, swagerDef) {
  if (err) {
    console.log(e);
    return;
  }

  swagger = swagerDef;

  // Generates an array of JavaScript test files following specified configuration
  var arrTests = stt.testGen(swagger, config);
  for (var i=0; i < arrTests.length; i++) {
    fs.writeFileSync(path+arrTests[i].name,arrTests[i].test,'utf8')
  }

});
