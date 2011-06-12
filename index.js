var parse = require('uglify-js').parser.parse;
var ug = require('uglify-js').uglify;

var deparse = function (ast, b) {
    return ug.gen_code(ast, { beautify : b });
};

var traverse = require('traverse');
var vm = require('vm');

var burrito = module.exports = function (code, cb) {
    var ast = parse(code.toString(), false, true);
    
    var ast_ = traverse(ast).map(function mapper () {
        wrapNode(this, cb);
    });
    
    return deparse(parse(deparse(ast_)), true);
};

function wrapNode (state, cb) {
    var node = state.node;
    
    var ann = Array.isArray(node) && node[0]
    && typeof node[0] === 'object' && node[0].name
        ? node[0]
        : null
    ;
    
    if (!ann) return undefined;
    
    var self = {
        name : ann.name,
        node : node,
        wrap : function (s) {
            var subsrc = deparse(
                traverse(node).map(function (x) {
                    if (!this.isRoot) wrapNode(this, cb)
                })
            );
            
            var src = typeof s === 'function'
                ? s(subsrc)
                : s.toString().replace(/%s/g, function () {
                    return subsrc
                })
            ;
            
            var expr = parse(src);
            state.update(expr, true);
        },
    };
    
    if (cb) cb(self);
    
    return self;
}

burrito.microwave = function (code, context, cb) {
    if (!cb) { cb = context; context = {} };
    if (!context) context = {};
    
    var src = burrito(code, cb);
    return vm.runInNewContext(src, context);
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
