var parse = require('uglify-js').parser.parse;
var ug = require('uglify-js').uglify;

var deparse = function (ast, b) {
    return ug.gen_code(ast, { beautify : b });
};

var traverse = require('traverse');

var burrito = module.exports = function (code, cb) {
    var ast = parse(code.toString(), false, true);
    
    var ast_ = traverse(ast).map(function mapper (node) {
        var state = this;
        
        var ann = Array.isArray(node) && node[0]
        && typeof node[0] === 'object' && node[0].name
            ? node[0]
            : null
        ;
        
        if (ann) cb({
            name : ann.name,
            node : node,
            wrap : function (s) {
                var subsrc = deparse(
                    traverse(node).map(function (x) {
                        if (!this.isRoot) return mapper.call(this, x)
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
            }
        });
    });
    
    return deparse(parse(deparse(ast_)), true);
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
