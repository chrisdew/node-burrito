var burrito = require('./');
var testCode = require('./test');

var pro = require('uglify-js').uglify;

var post = burrito(testCode, function trace (line, comment) {
    var code = pro.gen_code(line, { beautify: true });
    var data = line[0]

    var args = []
    if (!comment) comment = ""
    if (typeof data === "object") {
            code = code.split(/\n/).shift()
            args = [ [ "string", data.toString() ],
                     [ "string", code ],
                     [ "num", data.start.line ],
                     [ "num", data.start.col ],
                     [ "num", data.end.line ],
                     [ "num", data.end.col ]]
    } else {
            args = [ [ "string", data ],
                     [ "string", code ]]

    }
    return [ "call", [ "name", "trace" ], args ];
});

console.log(post);
