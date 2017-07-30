var yaml = require('js-yaml');
var fs = require('fs');
var reffedSwagger;
var path = './api/';
var filename = 'swagger.json';
var fromFile = './api/swagger.yaml';

// 3rd param will be the filename to write to.
if (process.argv[2]) {
  filename = process.argv[2];
}

// 4th param will the source file. Expect full path.
if (process.argv[3]) {
  fromFile = process.argv[3];
}

var fromFileStat = fs.statSync(fromFile);
if (!fromFileStat) {
  console.log('cannot stat File: ' + fromFile);
  return;
}

// Get document, or throw exception on error
try {
  reffedSwagger = yaml.safeLoad(fs.readFileSync(fromFile, 'utf8'));
} catch (e) {
  console.log(e);
  return;
}

fs.writeFileSync(path + filename, JSON.stringify(reffedSwagger), 'utf8');
