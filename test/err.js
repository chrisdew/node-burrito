var assert = require('assert');
var burrito = require('../');

exports.wrapError = function () {
    try {
        var src = burrito('f() && g()', function (node) {
            if (node.name === 'binary') node.wrap('h(%a, %b')
        });
        assert.fail('should have blown up');
    }
    catch (err) {
        assert.ok(err.message.match(/unexpected/i));
        assert.ok(err instanceof SyntaxError);
        assert.ok(!err.stack.match(/uglify-js/));
        assert.equal(err.line, 0);
        assert.equal(err.col, 8);
        assert.equal(err.pos, 8);
    }
};

exports.syntaxError = function () {
    try {
        var src = burrito('f() && g())', function (node) {
            if (node.name === 'binary') node.wrap('h(%a, %b)')
        });
        assert.fail('should have blown up');
    }
    catch (err) {
        assert.ok(err.message.match(/unexpected/i));
        assert.ok(err instanceof SyntaxError);
        assert.ok(!err.stack.match(/uglify-js/));
    }
};
