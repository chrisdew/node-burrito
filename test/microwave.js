var assert = require('assert');

var burrito = require('burrito');
var fs = require('fs');
var vm = require('vm');
var traverse = require('traverse');
var _ = require('underscore');

var src = function () {
    var w = 5;
    var x = function (j) {
        for (var i = 0; i < 5; i ++) {
            //throw new Error('wow');
            if (j == 2 && i === 3) throw new Error('meow');
        }
        var y = 4;
    };
    var z = 5;
    
    for (var j = 0; j < 5; j++) x(j);
};

exports.microwave = function () {
    var stack = [];
    var last = null;
    
    try {
        burrito.microwave(src, function (code) {
            var cur = _(traverse.nodes(code).reverse())
                .detect(function (x) { return x && x.end })
            ;
            
            if (cur && cur.end) {
                while (stack.length) {
                    var fn = stack[stack.length - 1];
                    if (
                    cur.start.pos < fn.end.pos
                    && cur.end.pos > fn.end.pos
                    ) {
                        stack.pop();
                    }
                    else break;
                }
            }
            last = code;
            
            traverse(code).forEach(function (node) {
                if (node !== null && typeof node === 'object') {
                    var isFn = node.name === 'function'
                        || node.name === 'defun';
                    if (isFn) stack.push(node);
                    //if (node.name === 'call') stack.push(node);
                }
            });
        });
    }
    catch (err) {
        //console.log(err.stack);
        
        stack.forEach(function (code) {
            console.log(code.name);
            console.log('    ' + code.start.line + ':' + code.start.col);
            console.log('    ' + code.end.line + ':' + code.end.col);
        });
        
        var nodes = traverse.nodes(last);
        var start = _(nodes)
            .detect(function (x) { return x.start })
            .start
        ;
        
        var end = _(nodes.slice().reverse())
            .detect(function (x) { return x.end })
            .end
        ;
        
        console.log(err.toString() + ' at ' + start.line + ':' + start.col);
    }
};
