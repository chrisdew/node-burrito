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

kudos
=====

Shamelessly lifted from isaacs's nifty tmp/instrument.js thingy from uglify-js.
