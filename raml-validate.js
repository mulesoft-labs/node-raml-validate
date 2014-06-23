/**
 * `Object.prototype.toString` as a function.
 *
 * @type {Function}
 */
var toString = Function.prototype.call.bind(Object.prototype.toString);

/**
 * Check the value is a valid date.
 *
 * @param  {Date}    check
 * @return {Boolean}
 */
var isDate = function (check) {
  return toString(check) === '[object Date]' && !isNaN(check.getTime());
};

/**
 * Check if the value is a boolean.
 *
 * @param  {Boolean}  check
 * @return {Boolean}
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
 * @param  {Number}  check
 * @return {Boolean}
 */
var isInteger = function (check) {
  return typeof check === 'number' && check % 1 === 0;
};

/**
 * Check if the value is a number.
 *
 * @param  {Number}  check
 * @return {Boolean}
 */
var isNumber = function (check) {
  return typeof check === 'number' && isFinite(check);
};

/**
 * Check whether the value is a file.
 *
 * @param  {*}       check
 * @return {Boolean}
 */
var isFile = function (check) {
  return typeof check === 'string' || typeof check === 'object';
};

/**
 * Check a number is not smaller than the minimum.
 *
 * @param  {Number}   min
 * @return {Function}
 */
var isMinimum = function (min) {
  return function (check) {
    return check >= min;
  };
};

/**
 * Check a number doesn't exceed the maximum.
 *
 * @param  {Number}  max
 * @return {Boolean}
 */
var isMaximum = function (max) {
  return function (check) {
    return check <= max;
  };
};

/**
 * Check a string is not smaller than a minimum length.
 *
 * @param  {Number}  min
 * @return {Boolean}
 */
var isMinimumLength = function (min) {
  return function (check) {
    return check.length >= min;
  };
};

/**
 * Check a string does not exceed a maximum length.
 *
 * @param  {Number}  max
 * @return {Boolean}
 */
var isMaximumLength = function (max) {
  return function (check) {
    return check.length <= max;
  };
};

/**
 * Check a value is equal to anything in an array.
 *
 * @param  {Array}    values
 * @return {Function}
 */
var isEnum = function (values) {
  return function (check) {
    return values.indexOf(check) > -1;
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

  return pattern.test.bind(pattern);
};

/**
 * Transform arguments into an object.
 *
 * @param  {Boolean} valid
 * @param  {String}  rule
 * @param  {*}       value
 * @param  {String}  key
 * @return {Object}
 */
var toValidationObject = function (valid, rule, value, key) {
  return { valid: valid, rule: rule, value: value, key: key };
};

/**
 * Convert a rules object into a simple validation function.
 *
 * @param  {Object}   rule
 * @return {Function}
 */
var toValidation = function (config, rules, types) {
  var fns = [];

  // Push the type validation onto the stack first.
  if (typeof types[config.type] === 'function') {
    fns.push(['type', types[config.type]]);
  }

  // Iterate over all of the keys and dynamically push validation rules.
  Object.keys(config).filter(function (rule) {
    return rule !== 'type' && rule !== 'type';
  }).forEach(function (rule) {
    if (typeof rules[rule] === 'function') {
      fns.push([rule, rules[rule](config[rule], rule)]);
    }
  });

  /**
   * Run every validation that has been attached.
   *
   * @param  {String}  value
   * @return {Boolean}
   */
  var isValid = function (value, key, object) {
    var rule;

    // Check every validation rule for validity.
    var valid = fns.every(function (validation) {
      var valid = validation[1](value, key, object);

      if (!valid) {
        rule = validation[0];
      }

      return valid;
    });

    return toValidationObject(valid, rule, value, key);
  };

  /**
   * Returns a boolean based on the previous validation rules.
   *
   * @param  {String}  value
   * @param  {String}  key
   * @param  {Object}  object
   * @return {Boolean}
   */
  return function (value, key, object) {
    // If the value is empty, validate based on whether it was required.
    if (value == null) {
      return toValidationObject(!config.required, 'required', value, key);
    }

    // Validate an array of values.
    if (config.repeat) {
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          var validity = isValid(value[i], key, object);

          if (!validity.valid) {
            return validity;
          }
        }

        return toValidationObject(true, 'repeat', value, key);
      }

      return toValidationObject(false, 'repeat', value, key);
    }

    return isValid(value, key, object);
  };
};

/**
 * Every time you require the module you're expected to call it as a function
 * to create a new instance. This is to ensure two modules can't make competing
 * changes with their own validation rules.
 *
 * @return {Function}
 */
module.exports = function () {
  /**
   * Return a validation function that validates a model based on the schema.
   *
   * @param  {Object}   schema
   * @return {Function}
   */
  var validate = function (schema) {
    var validations = {};

    // Convert all parameters into validation functions.
    Object.keys(schema).forEach(function (param) {
      var config = schema[param];

      validations[param] = toValidation(config, validate.RULES, validate.TYPES);
    });

    /**
     * The function accepts an object to be validated. All rules are already
     * precompiled.
     *
     * @param  {Object}  model
     * @return {Boolean}
     */
    return function (model) {
      model = model || {};

      // Map all validations to their object and filter for failures.
      var errors = Object.keys(validations).map(function (param) {
        var value      = model[param];
        var validation = validations[param];

        // Return the validation result.
        return validation(value, param, model);
      }).filter(function (validation) {
        return !validation.valid;
      });

      return {
        valid:  errors.length === 0,
        errors: errors
      };
    };
  };

  /**
   * Provide validation of types.
   *
   * @type {Object}
   */
  validate.TYPES = {
    date:    isDate,
    number:  isNumber,
    integer: isInteger,
    boolean: isBoolean,
    string:  isString,
    file:    isFile
  };

  /**
   * Provide overridable validation of parameters.
   *
   * @type {Object}
   */
  validate.RULES = {
    minimum:   isMinimum,
    maximum:   isMaximum,
    minLength: isMinimumLength,
    maxLength: isMaximumLength,
    enum:      isEnum,
    pattern:   isPattern
  };

  /**
   * Return the validate function.
   */
  return validate;
};
