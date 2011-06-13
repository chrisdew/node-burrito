var parse = require('uglify-js').parser.parse;
var ug = require('uglify-js').uglify;

var deparse = function (ast, b) {
    return ug.gen_code(ast, { beautify : b });
};

var traverse = require('traverse');
var vm = require('vm');

var burrito = module.exports = function (code, cb) {
    try {
        var ast = parse(code.toString(), false, true);
    }
    catch (err) {
        throw new SyntaxError(err.message);
    }
    
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
        start : node[0].start,
        end : node[0].end,
        value : node.slice(1),
        wrap : function (s) {
            var subsrc = deparse(
                traverse(node).map(function (x) {
                    if (!this.isRoot) wrapNode(this, cb)
                })
            );
            
            if (self.name === 'binary') {
                var a = deparse(traverse(node[2]).map(function (x) {
                    if (!this.isRoot) wrapNode(this, cb)
                }));
                var b = deparse(traverse(node[3]).map(function (x) {
                    if (!this.isRoot) wrapNode(this, cb)
                }));
            }
            
            var src = '';
            
            if (typeof s === 'function') {
                if (self.name === 'binary') {
                    src = s(subsrc, a, b);
                }
                else {
                    src = s(subsrc);
                }
            }
            else {
                src = s.toString()
                    .replace(/%s/g, function () {
                        return subsrc
                    })
                ;
                
                if (self.name === 'binary') {
                    src = src
                        .replace(/%a/g, function () { return a })
                        .replace(/%b/g, function () { return b })
                    ;
                }
            }
            
            try {
                // without this try/catch the stack gets deep into uglify
                var expr = parse(src);
                state.update(expr, true);
            }
            catch (err) {
                throw new SyntaxError(err.message);
            }
        },
    };
    
    var cache = {};
    
    if (state.isRoot) self.parent = null;
    else Object.defineProperty(self, 'parent', {
        get : function () {
            if (!cache.parent) {
                var s = state;
                var x;
                do {
                    s = s.parent;
                    if (s) x = wrapNode(s);
                } while (s && !x);
                
                cache.parent = x;
            }
            
            return cache.parent;
        }
    });
    
    Object.defineProperty(self, 'source', {
        get : function () {
            if (!cache.source) cache.source = deparse(node);
            return cache.source;
        }
    });
    
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
