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
