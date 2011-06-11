var assert = require('assert');
var burrito = require('burrito');
var vm = require('vm');

exports.wrapCalls = function () {
    var src = burrito('f() && g(h())\nfoo()', function (node) {
        if (node.name === 'call') node.wrap('qqq(%s)');
        if (node.name === 'binary') node.wrap('bbb(%s)');
    });
    
    var tg = setTimeout(function () {
        assert.fail('g() never called');
    }, 5000);
    
    var times = { bbb : 0, qqq : 0 };
    
    var res = [];
    vm.runInNewContext(src, {
        bbb : function (x) {
            times.bbb ++;
            res.push(x);
            return x;
        },
        qqq : function (x) {
            times.qqq ++;
            res.push(x);
            return x;
        },
        f : function () { return true },
        g : function (h) {
            clearTimeout(tg);
            assert.equal(h, 7);
            return h !== 7
        },
        h : function () { return 7 },
        foo : function () { return 'foo!' },
    });
    
    assert.deepEqual(res, [
        true, // f()
        7, // h()
        false, // g(h())
        false, // f() && g(h())
        'foo!', // foo()
    ]);
    assert.equal(times.bbb, 1);
    assert.equal(times.qqq, 4);
};
