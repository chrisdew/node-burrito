var parse = require('uglify-js').parser.parse;
var deparse = require('uglify-js').uglify.gen_code;

var util = require('util');
var dir = function (obj) {
    console.log(util.inspect(obj, null, 10));
};

var vm = require('vm');
var traverse = require('traverse');

var burrito = module.exports = function (code, cb) {
    var ast = parse(code.toString());
    var ast_ = traverse(ast).map(function (node) {
        var state = this;
        
        if (Array.isArray(node)) {
            var cnode = {
                name : node[0],
                wrap : function (wrapper) {
                    cnode.code = wrapper.replace(/%s/g, function () {
                        return cnode.code;
                    });
                }
            };
            
            var cached = { code : null };
            Object.defineProperty(cnode, 'code', {
                get : function () {
                    if (!cached.code) cached.code = deparse(state.node);
                    return cached.code;
                },
                set : function (s) {
                    cached.code = null;
                    state.update(parse(s));
                }
            });
            
            cb(cnode);
        }
    });
    
    return deparse(ast_);
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
