var burrito = require('burrito');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js');
var wrapped = burrito.wrap('trace', src);

var vm = require('vm');
var sprintf = require('sprintf').sprintf;

var code = null;

try {
    vm.runInNewContext(wrapped, {
        trace : function (c) { code = c }
    });
}
catch (err) {
    console.log(err.toString());
    
    var lines = src.toString()
        .split('\n')
        .slice(Math.max(0, code.start.line - 2), code.end.line + 3)
        .map(function (line, i) {
            var lineNum = code.start.line - 2 + i;
            var active = code.start.line <= lineNum && lineNum <= code.end.line;
            return sprintf('%3s', lineNum) + (active ? ' >> ' : ' :: ') + line;
        })
        .join('\n')
    ;
    console.log(lines);
}
