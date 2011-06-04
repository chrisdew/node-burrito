module.exports = function test() {
        // simple stats
        a = 5;
        c += a + b;
        "foo";

        // var
        var foo = 5;
        const bar = 6, baz = 7;

        // switch block.  note we can't track case lines the same way.
        switch (foo) {
            case "fallthrough": // should put a trace here to know which
            case 5:             // case branch actually was triggered?
            case "foo":
                return 1;
            case "bar":
                return 2;
            default:
                return 100;
        }

        // for/for in
        for (var i = 0; i < 5; ++i) {
                console.log("Hello " + i);
        }
        for (var i in [ 1, 2, 3]) {
                console.log(i);
        }

        for (var i = 0; i < 5; ++i)
                console.log("foo");

        for (var i = 0; i < 5; ++i) {
                console.log("foo");
        }

        var k = plurp() ? 1 : 0;
        var x = a ? doX(y) && goZoo("zoo")
              : b ? blerg({ x: y })
              : null;

        var x = X || Y;
}
