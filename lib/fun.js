var type = require('./type'),
    object = require('./object');

/**
 * @preserve jFun - JavaScript Pattern Matching v0.12
 *
 * Licensed under the new BSD License.
 * Copyright 2008, Bram Stein
 * All rights reserved.
 */
/*global buildMatch*/
var fun = (function () {
	function matchAtom(patternAtom) {
		var type = typeof patternAtom,
			value = patternAtom;

		return function (valueAtom, bindings) {
			return (typeof valueAtom === type && valueAtom === value) ||
					(typeof value === 'number' && isNaN(valueAtom) && isNaN(value));
		};
	}

	function matchRegExp(patternRegExp){
		return function(value, bindings){
			return ! (typeof value === undefined) && typeof value === 'string' && patternRegExp.test(value) &&
        bindings.push(value) > 0;
		};
	}

	function matchFunction(patternFunction) {
		return function (value, bindings) {
			return value.constructor === patternFunction &&
				bindings.push(value) > 0;
		};
	}

	function matchArray(patternArray) {
		var patternLength = patternArray.length,
			subMatches = patternArray.map(function (value) {
				return buildMatch(value);
			});

		return function (valueArray, bindings) {
			return patternLength === valueArray.length &&
				valueArray.every(function (value, i) {
					return (i in subMatches) && subMatches[i](valueArray[i], bindings);
				});
		};
	}

	function matchObject(patternObject) {
		var type = patternObject.constructor,
			patternLength = 0,
			// Figure out the number of properties in the object
			// and the keys we need to check for. We put these
			// in another object so access is very fast. The build_match
			// function creates new subtests which we execute later.
			subMatches = object.map(patternObject, function (value) {
				patternLength += 1;
				return buildMatch(value);
			});

		// We then return a function which uses that information
		// to check against the object passed to it.
		return function (valueObject, bindings) {
			var valueLength = 0;

			// Checking the object type is very fast so we do it first.
			// Then we iterate through the value object and check the keys
			// it contains against the hash object we built earlier.
			// We also count the number of keys in the value object,
			// so we can also test against it as a final check.
			return valueObject.constructor === type &&
				object.every(valueObject, function (value, key) {
					valueLength += 1;
					return (key in subMatches) && subMatches[key](valueObject[key], bindings);
				}) &&
				valueLength === patternLength;
		};
	}

	function buildMatch(pattern) {
		// A parameter can either be a function, or the result of invoking that
		// function so we need to check for both.
		if (pattern && (pattern === fun.parameter || pattern.constructor.name === fun.parameter().constructor.name)) {
			return function (value, bindings) {
				return bindings.push(value) > 0;
			};
		}
		else if (pattern && pattern.constructor === fun.wildcard.constructor) {
			return function () {
				return true;
			};
		}
		else if (type.isAtom(pattern)) {
			return matchAtom(pattern);
		}
		else if (type.isRegExp(pattern)) {
			return matchRegExp(pattern);
		}
		else if (type.isObject(pattern)) {
			return matchObject(pattern);
		}
		else if (type.isArray(pattern)) {
			return matchArray(pattern);
		}
		else if (type.isFunction(pattern)) {
			return matchFunction(pattern);
		}
	}

	return function () {
		var patterns = Array.prototype.slice.call(arguments, 0).map(function (value, i) {
				var len = value.length;
				return {
					m: buildMatch(value.slice(0, len - 1)),
					c: value[len - 1]
				};
			});

		return function () {
			var value = Array.prototype.slice.call(arguments, 0),
                result = [],
                i = 0,
                len = patterns.length;

			for (; i < len; i += 1) {
				if (patterns[i].m(value, result)) {
					return patterns[i].c.apply(this, result);
				}
				result = [];
			}
			// no matches were made so we throw an exception.
			throw 'No match for: ' + value;
		};
	};
}());

/**
 * Parameter
 */
fun.parameter = function (name, orElse) {
	function Parameter(n, o) {
		this.name = n;
		this.orElse = o;
	}
	return new Parameter(name, orElse);
};

fun.wildcard = (function () {
	function Wildcard() {}
	return new Wildcard();
}());

module.exports = fun;
