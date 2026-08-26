var fs = require('fs');
var code = fs.readFileSync('Script.js', 'utf8');
try {
  new Function(code);
  console.log("No syntax errors");
} catch(e) {
  console.log(e.toString());
}
