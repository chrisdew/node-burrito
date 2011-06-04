var burrito = require('burrito');
var fs = require('fs');

var src = burrito.wrap('trace', fs.readFileSync(__dirname + '/test.js'));
console.log(src);
