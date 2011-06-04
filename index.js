var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

var burrito = module.exports = function (code, trace) {
    code = code.toString();
    
    // true for the third arg specifies that we want
    // to have start/end tokens embedded in the statements
    var ast = jsp.parse(code, false, true);
    var w = pro.ast_walker();
    
    // we're gonna need this to push elements that we're currently looking at,
    // to avoid endless recursion.
    
    var analyzing = [];
    function do_stat() {
        var ret;
        if (this[0].start && analyzing.indexOf(this) < 0) {
            // without the `analyzing' hack, w.walk(this) would re-enter here leading
            // to infinite recursion
            analyzing.push(this);
            ret = [
                "splice",
                [ [ "stat", trace(this) ], w.walk(this) ]
            ];
            analyzing.pop(this);
        }
        return ret;
    }
    
    function do_cond(c, t, f) {
        return [
            this[0], w.walk(c),
            ["seq", trace(t), w.walk(t) ],
            ["seq", trace(f), w.walk(f) ]
        ];
    }
    
    function do_binary(c, l, r) {
        if (c !== "&&" && c !== "||") {
            return [ this[0], c, w.walk(l), w.walk(r) ];
        }
        return [
            this[0], c,
            ["seq", trace(l), w.walk(l) ],
            ["seq", trace(r), w.walk(r) ]
        ];
    }
    
    var new_ast = w.with_walkers({
        "stat"        : do_stat,
        "label"       : do_stat,
        "break"       : do_stat,
        "continue"    : do_stat,
        "debugger"    : do_stat,
        "var"         : do_stat,
        "const"       : do_stat,
        "return"      : do_stat,
        "throw"       : do_stat,
        "try"         : do_stat,
        "defun"       : do_stat,
        "if"          : do_stat,
        "while"       : do_stat,
        "do"          : do_stat,
        "for"         : do_stat,
        "for-in"      : do_stat,
        "switch"      : do_stat,
        "with"        : do_stat,
        "conditional" : do_cond,
        "binary"      : do_binary
    }, function () { return w.walk(ast) });
    
    return pro.gen_code(new_ast, { beautify : true });
};

burrito.wrap = function (wrapper, src) {
    var wrapName = typeof wrapper === 'string' ? wrapper : wrapper.name;
    
    var fsrc = src.toString();
    if (typeof src === 'function' && src.name === '') {
        fsrc = fsrc.replace(/^function \(/, function () {
            return 'function __anonymous_'
                + Math.floor(Math.random() * Math.pow(2,32)).toString(16)
                + '('
            ;
        });
    }
    
    var postSrc = burrito(fsrc, function (line, comment) {
        var code = pro.gen_code(line, { beautify : true });
        var data = line[0];
        
        var args = []
        if (!comment) comment = ""
        if (typeof data === "object") {
            code = code.split(/\n/).shift()
            args = [
                [ "string", data.toString() ],
                [ "string", code ],
                [ "num", data.start.line ],
                [ "num", data.start.col ],
                [ "num", data.end.line ],
                [ "num", data.end.col ]
            ];
        }
        else {
            args = [ [ "string", data ], [ "string", code ] ];
        }
        return [ "call", [ "name", wrapName ], args ];
    });
    
    if (typeof wrapper === 'function') {
        postSrc = wrapper.toString() + '\n' + postSrc;
    }
    
    return postSrc;
};
