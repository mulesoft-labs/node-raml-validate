var toString = Function.prototype.call.bind(Object.prototype.toString);

/**
 * Check the value is a valid date.
 *
 * @param  {String}  check
 * @return {Boolean}
 */
var isDate = function (check) {
  return toString(check) === '[object Date]';
};

/**
 * Check
 * @param  {[type]}  check [description]
 * @return {Boolean}       [description]
 */
var isBoolean = function (check) {
  return typeof check === 'boolean';
};

/**
 * Check the value is a string.
 *
 * @param  {String}  check
 * @return {Boolean}
 */
var isString = function (check) {
  return typeof check === 'string';
};

/**
 * Check if the value is an integer.
 *
 * @param  {String}  check
 * @return {Boolean}
 */
var isInteger = function (check) {
  return typeof check === 'number' && check % 1 === 0;
};

/**
 * Check if the value is a number.
 *
 * @param  {String}  check
 * @return {Boolean}
 */
var isNumber = function (check) {
  return typeof check === 'number' && isFinite(check);
};

/**
 * Check a number is between two values.
 *
 * @param  {Number}   min
 * @param  {Number}   max
 * @return {Function}
 */
var isNumberBetween = function (min, max) {
  // Sanitize min and max values.
  max = max == null ?  Infinity : max;
  min = min == null ? -Infinity : min;

  return function (check) {
    return check >= min && check <= max;
  };
};

/**
 * Check a string length is between two values.
 *
 * @param  {Number}   min
 * @param  {Number}   max
 * @return {Function}
 */
var isLengthBetween = function (min, max) {
  // Sanitize min and max values.
  max = max == null ?  Infinity : max;
  min = min == null ? -Infinity : min;

  return function (check) {
    return check.length >= min && check.length <= max;
  };
};

/**
 * Check a value is equal to anything in an enum.
 *
 * @param  {Array}    values
 * @return {Function}
 */
var isEnum = function (values) {
  return function (check) {
    return values.some(function (value) {
      return check === value;
    });
  };
};

/**
 * Check if a pattern matches the value.
 *
 * @param  {(String|RegExp)} pattern
 * @return {Function}
 */
var isPattern = function (pattern) {
  if (toString(pattern) !== '[object RegExp]') {
    pattern = new RegExp(pattern);
  }

  return function (check) {
    return pattern.test(check);
  };
};

var TYPE_VALIDATION = {
  date:    isDate,
  number:  isNumber,
  integer: isInteger,
  boolean: isBoolean,
  string:  isString
};

/**
 * Provide a validation function that accepts the schema and returns a reusable
 * validation function.
 *
 * @param  {Object}   params
 * @return {Function}
 */
exports = module.exports = function (params) {
  var validations = {};

  // Convert all parameters into validation functions.
  Object.keys(params).forEach(function (param) {
    validations[param] = exports.rule(params[param]);
  });

  /**
   * The returned function accepts an object to be validated.
   *
   * @param  {Object}  obj
   * @return {Boolean}
   */
  return function (obj) {
    obj = obj || {};

    return Object.keys(validations).every(function (validation) {
      return validations[validation](obj[validation]);
    });
  };
};

/**
 * Convert a single rule into a validation function.
 *
 * @param  {Object}   rule
 * @return {Function}
 */
exports.rule = function (rule) {
  var fns  = [];
  var type = TYPE_VALIDATION[rule.type] ? rule.type : 'string';

  // Push the type validation onto the stack.
  fns.push(TYPE_VALIDATION[type]);

  // Number validations come with `minimum` and `maximum`.
  if (type === 'number' || type === 'integer') {
    if (rule.minimum || rule.maximum) {
      fns.push(isNumberBetween(rule.minimum, rule.maximum));
    }
  }

  // String validations have more functionality built in.
  if (type === 'string') {
    if (Array.isArray(rule.enum)) {
      fns.push(isEnum(rule.enum));
    }

    if (rule.pattern) {
      fns.push(isPattern(rule.pattern));
    }

    if (rule.minLength || rule.maxLength) {
      fns.push(isLengthBetween(rule.minLength, rule.maxLength));
    }
  }

  /**
   * Run every validation that has been attached.
   *
   * @param  {String}  value
   * @return {Boolean}
   */
  var isValid = function (value) {
    return fns.every(function (fn) {
      return fn(value);
    });
  };

  /**
   * Return a function that returns a boolean based on the validation rules.
   *
   * @param  {String}  value
   * @return {Boolean}
   */
  return function (value) {
    // Short circuit validation if the value is allowed to be empty (and is).
    if (!rule.required && value == null) {
      return true;
    }

    // Check repeated values.
    if (rule.repeat) {
      return Array.isArray(value) && value.every(isValid);
    }

    return isValid(value);
  };
};
