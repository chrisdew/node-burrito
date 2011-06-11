burrito
=======

Burrito wraps up all javascript expressions in a trace function before executing
them.

This is super useful if you want to roll your own stack traces or build a code
coverage tool.

examples
========

wrap
----

examples/wrap.js

````javascript
var burrito = require('burrito');

var src = burrito('f() && g()', function (node) {
    if (node.name === 'call') node.wrap('qqq(%s)');
});

console.log(src);
````

output:

    qqq(f())&&qqq(g())

methods
=======

    var burrito = require('burrito');

burrito(code, trace)
--------------------

Given some source `code` and a function `trace`, walk the ast line-by-line.

burrito.wrap(wrapper, src)
--------------------------

Wrap all the expressions in some source code `src` (potentially inlined as
function) with `wrapper`, a function or name of a function to execute.

installation
============

With [npm](http://npmjs.org) you can just:

    npm install burrito

kudos
=====

Heavily inspired by (and previously mostly lifted outright from) isaacs's nifty
tmp/instrument.js thingy from uglify-js.
