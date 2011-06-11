var burrito = require('burrito');

var src = burrito('f() && g()', function (node) {
    if (node.name === 'call') node.wrap('qqq(%s)');
});

console.log(src);
