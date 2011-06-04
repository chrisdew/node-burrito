burrito
=======

Burrito wraps up all javascript expressions in a trace function before executing
them.

This is super useful if you want to roll your own stack traces or build a code
coverage tool.

examples
========

inline
------

This example traps all of the expressions and prints them.

````javascript
var burrito = require('burrito');

var src = burrito.wrap(
    function (code) {
        console.dir(code);
    },
    function () {
        var xs = [ 1, 2, 3, 4 ];
        var factor = 10 || 4;
        
        return xs.map(function (x) {
            return factor * 10;
        });
    }
);

var vm = require('vm');
vm.runInNewContext(src, { console : console });
````

output:

    { statement: 'stat',
      line: '(function() {',
      start: { line: 0, column: 0 },
      end: { line: 7, column: 8 } }
    { statement: 'var',
      line: 'var xs = [ 1, 2, 3, 4 ];',
      start: { line: 1, column: 8 },
      end: { line: 1, column: 31 } }
    { statement: 'var',
      line: 'var factor = 10 || 4;',
      start: { line: 2, column: 8 },
      end: { line: 2, column: 28 } }
    { statement: 'num',
      line: '10',
      start: { line: 2, column: 21 },
      end: { line: 2, column: 21 } }
    { statement: 'return',
      line: 'return xs.map(function(x) {',
      start: { line: 4, column: 8 },
      end: { line: 6, column: 10 } }
    { statement: 'return',
      line: 'return factor * 10;',
      start: { line: 5, column: 12 },
      end: { line: 5, column: 30 } }
    { statement: 'return',
      line: 'return factor * 10;',
      start: { line: 5, column: 12 },
      end: { line: 5, column: 30 } }
    { statement: 'return',
      line: 'return factor * 10;',
      start: { line: 5, column: 12 },
      end: { line: 5, column: 30 } }
    { statement: 'return',
      line: 'return factor * 10;',
      start: { line: 5, column: 12 },
      end: { line: 5, column: 30 } }

trace
-----

This example is a silly little error printing lib that could be extended to do
full stack traces:

````javascript
var burrito = require('burrito');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js');
var wrapped = burrito.wrap('trace', src);

var vm = require('vm');
var sprintf = require('sprintf').sprintf;

var code = null;

try {
    vm.runInNewContext(wrapped, {
        trace : function (c) { code = c }
    });
}
catch (err) {
    console.log(err.toString());
    
    var lines = src.toString()
        .split('\n')
        .slice(Math.max(0, code.start.line - 2), code.end.line + 3)
        .map(function (line, i) {
            var lineNum = code.start.line - 2 + i;
            var active = code.start.line <= lineNum && lineNum <= code.end.line;
            return sprintf('%3s', lineNum) + (active ? ' >> ' : ' :: ') + line;
        })
        .join('\n')
    ;
    console.log(lines);
}
````

output:

    $ node trace.js 
    ReferenceError: c is not defined
      1 ::     // simple stats
      2 ::     a = 5;
      3 >>     c += a + b;
      4 ::     "foo";
      5 :: 

methods
=======

    var burrito = require('burrito');

burrito(code, trace)
--------------------

Given some source `code` and a function `trace`, walk the ast line-by-line.

.wrap(wrapper, src)
-------------------

Wrap all the expressions in some source code `src` (potentially inlined as
function) with `wrapper`, a function or name of a function to execute.

installation
============

With [npm](http://npmjs.org) you can just:

    npm install burrito

kudos
=====

Shamelessly lifted from isaacs's nifty tmp/instrument.js thingy from uglify-js.
