[![build status](https://secure.travis-ci.org/bramstein/funcy.png)](http://travis-ci.org/bramstein/funcy)
## Functional Pattern Matching in JavaScript

Pattern matching is a form of conditional branching which allows you to concisely match on data structure patterns and bind variables at the same time ( [Wikipedia](http://en.wikipedia.org/wiki/Conditional_statement#Pattern_matching)). Pattern matching is supported in some functional languages such as ML, Haskell, OCaml, and Erlang. This library implements pattern matching for the JavaScript language in an efficient and concise way. The following example shows what pattern matching in JavaScript looks like:

    var fact = fun(
        [0, function ()  1],
        [$, function (n) n * fact(n - 1)]
    );

The above function implements a simple factorial function using pattern matching. When you call `fact(10)` the value ‘10’ is matched against the first pattern ‘0’. This match fails and the next pattern is evaluated. The ‘$’ in the next pattern is an example of a parameter. A parameter matches anything, so the match succeeds and ‘10’ is passed as an argument to the anonymous function. Since this is a recursive function it will match the second pattern until the argument to the function reaches zero and then terminates. Note that this example uses JavaScript 1.8 syntax, code in previous JavaScript versions will be slightly more verbose.

**Note: This is an experiment, do not use this in real code**

## Usage

To use the library install its npm package:

    npm install funcy

And require it in your program:

    var fun = require('funcy');

The fun method takes one or more pattern expressions and returns a function which, when called, will try to match the values passed to the patterns. If a match is found an anonymous function corresponding to the matched pattern is executed, and any extracted values passed to it as arguments.

A pattern expression is an array literal with a variable number of patterns, and an anonymous function as the last item of the array. Patterns are explained in more detail in the next section.

### Patterns

A pattern is one of the following types: `atom`, `Object`, `Array`, `Function`, or the special wildcard and parameter patterns. The wildcard pattern matches against any value, but does not return anything. The parameter pattern on the other hand returns the value it was matched against, and also matches against any value.

<dl>
    <dt>Atom</dt>
    <dd>Atoms match against values that are strictly equal. No type conversion is performed. Atoms are any of the following JavaScript types (or values): `Number`, `String`, `Boolean`, `null`, `undefined`, `NaN`, and `Infinity`.</dd>
    
    <dt>Object</dt>
    <dd>Objects match against values that are objects, of the same type (determined by the `object.constructor` property), have the same number of properties with all keys and values being strictly equal. The order in which the properties are declared is not important. Property names cannot contain wildcards.</dd>
    <dt>Array</dt>
    <dd>Arrays match against values that are arrays, have the same number of elements with all elements being strictly equal and in the same order as the pattern array.</dd>
    
    <dt>Parameter</dt>
    <dd>Parameter matches against a value of any type, and returns that value as an argument to the anonymous function in the pattern expression. The values are given in the order the parameters are defined in the pattern(s).</dd>
    
    <dt>Wildcard</dt>
    <dd>Wildcard matches against a value of any type, but does not return that value.</dd>
    
    <dt>Function</dt>
    <dd>Functions match against values that are of the same type (determined by `function.constructor`.) If a match is successful the value is returned. `Parameter` and `Wildcard` are special instances of the `Function` pattern which do not check if the value and pattern are of the same type.</dd>
</dl>

The following are all valid pattern expressions with an empty anonymous function.

    // matches 1
    [1, function () {}]
    
    // matches {key: 'value'}
    [{key: 'value'}, function () {}]
    
    // matches the array [3, true]
    [[3, true], function () {}]
    
    // matches {key: x} and passes x as an argument to the anonymous function
    [{key: fun.parameter}, function (x) {}]
    
    // matches everything
    [fun.wildcard, function () {}]

The second last example shows how parameters can be passed to the anonymous functions, in essence extracting data from the value the pattern was matched against. Note that the parameters do not create named variables, but return their values in the order the parameters were declared. This means that the following example will bind the `x` property to the `y` argument, and the `y` property to the `x` argument in the anonymous function.

    [{x: $, y: $}, function (y, x) {}]

### API

The library exposes one method usually called `fun`, which takes one or more pattern expressions as arguments. The method has two additional properties, one for the wildcard pattern and one for the parameter pattern.

<dl>
    <dt>fun( pattern_expression1, pattern_expression2, ...)</dt>
    <dd>Creates a new function which performs pattern matching using the patterns in the pattern expressions, and executes their associated anonymous function if a match is made. Pattern expressions are tried for a potential match in the order they are declared. Throws an exception if none of the patterns in the expressions match.
</dd>
    <dt>fun.wildcard</dt>
    <dd>The wildcard pattern can be used to ‘mask out’ or ignore certain parts of the value it is matched against.</dd>

    <dt>fun.parameter</dt>
    <dd>The parameter pattern can be used to bind values to variables which are then passed as arguments to the anonymous function. The arguments are given in the same order as they were defined in the pattern(s).</dd>
</dl>

Pattern expressions are preprocessed (any operation that can be performed without knowledge of the value it will be matched against) so that the run-time costs of code using pattern matching is kept at a minimum. The pattern matcher also prioritizes match tests that are fast before performing more expensive tests, in order to find a suitable match as soon as possible.

## Examples

To keep my code (and these examples) concise I usually assign the special parameter and wildcard patterns to single character variable names. These are `$` for the parameter pattern and `_` for the wildcard pattern. The library does not define these by default in order to avoid conflicts with other libraries that use these variable names.

    var $ = fun.parameter;
    var _ = fun.wildcard;

Using these variables we can implement a simple (but inefficient) factorial function.

    var fact = fun(
        [0, function ()  { return 1; }],
        [$, function (n) { return n * fact(n - 1); }]
    );

In JavaScript 1.8 it is possible to use a shorthand closure syntax, so the above factorial function can be rewritten as:

    var fact = fun(
        [0, function ()  1],
        [$, function (n) n * fact(n - 1)]
    );

Another common use of pattern matching is to determine if a value is of a certain type and perform an action depending on the result. For example, let's say we have a print function which logs its value to the console. We would however like to customize the output for some data types. We can accomplish this using pattern matching as follows:

    var print = fun(
        // match and return Date values
        [Date, function (d) { ... }],
    
        // match and return String values
        [String, function (str) { ... }],
    
        // match and return any other type
        [$, function (o) { ... }]
    );

If the type of the value is `Date`, the first anonymous function will be executed and its value passed as argument. The same applies to values of type `String`. Any other value will be passed to the last anonymous function whose pattern acts as a catch-all.