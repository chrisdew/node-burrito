var assert = require('assert');

var burrito = require('burrito');
var fs = require('fs');
var vm = require('vm');

var src = fs.readFileSync(__dirname + '/trace/src.js');

exports.trace = function () {
    var wrapped = burrito.wrap('trace', src);
    var code = null;
    
    try {
        vm.runInNewContext(wrapped, {
            trace : function (c) { code = c }
        });
        assert.fail('should have thrown');
    }
    catch (err) {
        assert.equal(err.type, 'not_defined');
        assert.deepEqual(err.arguments, [ 'c' ]);
        assert.equal(code.start.line, 3);
        assert.equal(code.end.line, 3);
    }
};
