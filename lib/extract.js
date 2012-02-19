var fun = require('./fun');

/**
 * Extract
 */
var extract = (function () {
	function bindVariables(pattern, value, result) {
		if (pattern && pattern.constructor.name === fun.parameter().constructor.name) {
			result[pattern.name] = pattern.orElse ? value || pattern.orElse : value;
		}
		else if (pattern && pattern.constructor === fun.wildcard.constructor) {
			// we ignore wildcards
		}
		// it would be nice if we could safely extend Object.prototype
		// and collapse the code for Object and Array into one.
		else if (type.isObject(pattern) && type.isObject(value)) {
            for (var key in pattern) {
				if (key in value) {
					bindVariables(pattern[key], value[key], result);
				}
				else if (pattern[key].hasOwnProperty('orElse')) {
					result[pattern[key].name] = v.orElse;
				}
			}
		}
		else if (type.isArray(pattern) && type.isArray(value)) {
            pattern.forEach(function (v, key) {
				if (key in value) {
					bindVariables(v, value[key], result);
				}
				else if (v.hasOwnProperty('orElse')) {
					result[v.name] = v.orElse;
				}
			});
		}
		else if (pattern !== undefined) {
			throw new TypeError('The pattern should only contain variables.');
		}
	}

	return function (pattern, value, result) {
		result = result || {};
		bindVariables(pattern, value, result);
		return result;
	};
}());

module.exports = fun;