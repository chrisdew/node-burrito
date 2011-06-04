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
            trace : function (x) { code = x }
        });
        assert.fail('should have thrown');
    }
    catch (err) {
        assert.equal(err.type, 'not_defined');
        assert.deepEqual(err.arguments, [ 'c' ]);
        assert.equal(code.start.line, 3);
        assert.equal(code.end.line, 3);
    }
    
    try {
        vm.runInNewContext(wrapped, {
            trace : function (x) { code = x },
            a : 100,
            b : 200,
            c : 300,
            console : { log : function () {} },
        });
    }
    catch (err) {
        assert.equal(err.type, 'non_object_property_load');
        assert.deepEqual(err.arguments, [ 'moo', undefined ]);
        assert.equal(code.start.line, 39);
        assert.equal(code.end.line, 39);
        assert.equal(code.statement, 'stat');
        assert.equal(code.line, 'undefined.moo;');
    }
};
