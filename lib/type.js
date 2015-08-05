function getInternalType(value) {
    return Object.prototype.toString.apply(value);
}

var type = {
    isAtom: function (value) {
        return ((typeof value !== 'object' || value === null) && 
            typeof value !== 'function') || 
            type.isBoolean(value) || type.isNumber(value) || type.isString(value);
    },

    isRegExp: function (value) {
        return (value.constructor.name === "RegExp" || value instanceof RegExp);
    },

    isNumber: function (value) {
        return (typeof value === 'number' || value instanceof Number) && !isNaN(value);
    },

    isString: function (value) {
        return typeof value === 'string' || value instanceof String;
    },

    isBoolean: function (value) {
        return value !== null && 
            (typeof value === 'boolean' || value instanceof Boolean);
    },

    isArray: function (value) {
        return Array.isArray(value);
    },

    isObject: function (value) {
        return getInternalType(value) === '[object Object]';
    },

    isFunction: function (value) {
        return typeof value === 'function';
    },

    isDefined: function (value) {
        return typeof value !== 'undefined';
    }
};

module.exports = type;
