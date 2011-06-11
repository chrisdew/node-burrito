var par = require('uglify-js').parser;
var ug = require('uglify-js').uglify;

var burrito = module.exports = function (code, cb) {
    var ast = par.parse(code.toString(), false, true);
    var w = ug.ast_walker();
    
    var names = [
        'stat', 'label', 'break', 'continue', 'debugger', 'var', 'const',
        'return', 'throw', 'try', 'defun', 'if', 'while', 'do', 'for',
        'for-in', 'switch', 'with', 'conditional', 'binary'
    ];
    
    var visiting = [];
    
    var fn = function (name, xs) {
console.dir([ name, xs ]);
        return xs;
    };
    
    var ast_ = w.with_walkers(
        names.reduce(function (acc, name) {
            acc[name] = function (c, x, y) {
                if (name === 'binary') {
                    return fn(name, [ this[0], c, w.walk(x), w.walk(y) ]);
                }
                else if (name === 'conditional') {
                    return fn(name, [ this[0], w.walk(c), w.walk(x), w.walk(y) ]);
                }
                else {
                    var ret;
                    if (visiting.indexOf(this) < 0) {
                        visiting.push(this);
                        ret = fn(name, [ this[0], w.walk(this) ]);
                        visiting.pop(this);
                    }
                    return ret;
                }
            };
            return acc;
        }, {}),
        function () { return w.walk(ast) }
    );
    
    return ug.gen_code(ast_, { beautify: true });
};

burrito.generateName = function (len) {
    var name = '';
    var lower = '$'.charCodeAt(0);
    var upper = 'z'.charCodeAt(0);
    
    while (name.length < len) {
        var c = String.fromCharCode(Math.floor(
            Math.random() * (upper - lower + 1) + lower
        ));
        if ((name + c).match(/^[A-Za-z_$][A-Za-z0-9_$]*$/)) name += c;
    }
    
    return name;
};
