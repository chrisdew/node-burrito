// all in one file

var burrito = require('burrito');
var fs = require('fs');

var src = burrito.wrap(
    function trace () {
        console.dir(arguments);
    },
    function () {
        var xs = [ 1, 2, 3, 4 ];
        var factor = 10;
        
        return xs.map(function (x) {
            return factor * 10;
        });
    }
);
console.log(src);
