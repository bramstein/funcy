var fun = require('../lib/fun'),
    $ = fun.parameter;

var fact = fun(
    [0, function ()  { return 1; }],
    [$, function (n) { return n * fact(n - 1); }]
);

console.log(fact(5));
