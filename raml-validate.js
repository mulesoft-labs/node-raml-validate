var toString = Object.prototype.toString
var ramlTypesystem = require('raml-typesystem')

/**
 * Check the value is a valid date.
 *
 * @param  {Date}    check
 * @return {Boolean}
 */
function isDate (check) {
  return toString.call(check) === '[object Date]' && !isNaN(check.getTime())
}

/**
 * Check if the value is a boolean.
 *
 * @param  {Boolean}  check
 * @return {Boolean}
 */
function isBoolean (check) {
  return typeof check === 'boolean'
}

/**
 * Check the value is a string.
 *
 * @param  {String}  check
 * @return {Boolean}
 */
function isString (check) {
  return typeof check === 'string'
}

/**
 * Check if the value is an integer.
 *
 * @param  {Number}  check
 * @return {Boolean}
 */
function isInteger (check) {
  return typeof check === 'number' && check % 1 === 0
}

/**
 * Check if the value is a number.
 *
 * @param  {Number}  check
 * @return {Boolean}
 */
function isNumber (check) {
  return typeof check === 'number' && isFinite(check)
}

/**
 * Check a number is not smaller than the minimum.
 *
 * @param  {Number}   min
 * @return {Function}
 */
function isMinimum (min) {
  return function (check) {
    return check >= min
  }
}

/**
 * Check a number doesn't exceed the maximum.
 *
 * @param  {Number}  max
 * @return {Boolean}
 */
function isMaximum (max) {
  return function (check) {
    return check <= max
  }
}

/**
 * Check a string is not smaller than length.
 *
 * @param  {Number}  min
 * @return {Boolean}
 */
function isMinimumLength (min) {
  return function (check) {
    return Buffer.byteLength(check) >= min
  }
}

/**
 * Check a string does not exceed length.
 *
 * @param  {Number}  max
 * @return {Boolean}
 */
function isMaximumLength (max) {
  return function (check) {
    return Buffer.byteLength(check) <= max
  }
}

/**
 * Check a value is equal to anything in an array.
 *
 * @param  {Array}    values
 * @return {Function}
 */
function isEnum (values) {
  return function (check) {
    return values.indexOf(check) > -1
  }
}

/**
 * Check if a pattern matches the value.
 *
 * @param  {(String|RegExp)} pattern
 * @return {Function}
 */
function isPattern (pattern) {
  if (toString.call(pattern) !== '[object RegExp]') {
    pattern = new RegExp(pattern)
  }

  return pattern.test.bind(pattern)
}

/**
 * Convert arguments into an object.
 *
 * @param  {Boolean} valid
 * @param  {*}       value
 * @param  {String}  key
 * @param  {String}  rule
 * @param  {String}  attr
 * @return {Object}
 */
function toValidationObject (valid, key, value, rule, attr) {
  return {
    valid: valid,
    rule: rule,
    attr: attr,
    value: value,
    key: key
  }
}

/**
 * Convert a single config into a function.
 *
 * @param  {Object}   config
 * @param  {Object}   rules
 * @return {Function}
 */
function toValidationFunction (config, rules) {
  var fns = []

  // Iterate over the keys and dynamically push validation rules.
  Object.keys(config).forEach(function (rule) {
    if (rules.hasOwnProperty(rule)) {
      fns.push([rule, rules[rule](config[rule], rule), config[rule]])
    }
  })

  /**
   * Run every validation.
   *
   * @param  {String} value
   * @param  {String} value
   * @param  {Object} object
   * @return {Object}
   */
  return function (value, key, object) {
    // Run each of the validations, returning when something fails.
    for (var i = 0; i < fns.length; i++) {
      var rule = fns[i][0]
      var fn = fns[i][1]
      var attr = fns[i][2]
      var valid = fn(value, key, object)

      if (!valid) {
        return toValidationObject(false, key, value, rule, attr)
      }
    }

    return toValidationObject(true, key, value)
  }
}

/**
 * Convert a rules object into a simple validation function.
 *
 * @param  {Object}   configs
 * @param  {Object}   rules
 * @param  {Object}   types
 * @return {Function}
 */
function toValidation (configs, rules, types) {
  // Initialize the configs to an array if they aren't already.
  configs = Array.isArray(configs) ? configs : [configs]

  var isOptional = !configs.length
  var simpleValidations = []
  var repeatValidations = []

  // Support an array of type validations.
  configs.forEach(function (config) {
    var validation = [config.type, toValidationFunction(config, rules)]

    // Allow short-circuiting of non-required values.
    if (!config.required) {
      isOptional = true
    }

    // Push validations into each stack depending on the "repeat".
    if (config.repeat) {
      repeatValidations.push(validation)
    } else {
      simpleValidations.push(validation)
    }
  })

  /**
   * Validate a value based on "type" and "repeat".
   *
   * @param  {*}      value
   * @param  {String} key
   * @param  {Object} object
   * @return {Object}
   */
  return function (value, key, object) {
    if (value == null) {
      return toValidationObject(
        isOptional, key, value, 'required', !isOptional
      )
    }

    var isArray = Array.isArray(value)
    var values = isArray ? value : [value]
    var validations = isArray ? repeatValidations : simpleValidations

    if (!validations.length) {
      return toValidationObject(false, key, value, 'repeat', !isArray)
    }

    var response = toValidationObject(true, key, value)

    validations.some(function (validation) {
      var isType = values.every(function (userValue) {
        var type = validation[0]
        var validType = types[type] && types[type](userValue, key, object)

        if (!validType) {
          response = toValidationObject(false, key, value, 'type', type)
        }

        return validType
      })

      if (!isType) {
        return false
      }

      values.every(function (value) {
        return (response = validation[1](value, key, object)).valid
      })

      return true
    })

    return response
  }
}

/**
 * Convert the output of raml-typesystem to a simple validation function.
 *
 * @param  {Object}   config
 * @return {Function}
 */
function toValidationRAML10 (config) {
  var ts = ramlTypesystem.loadType(config)
  var isOptional = false

  // Allow short-circuiting of non-required values.
  if (!config.required) {
    isOptional = true
  }

  /**
   * Validate a value.
   *
   * @param  {*}      value
   * @param  {String} key
   * @return {Object}
   */
  return function (value, key) {
    var result = ts.validate(value)
    var error = result.getErrors()[0]
    var errorSource = error && error.getSource()
    var errorKey = (errorSource && errorSource.facetName) ? errorSource.facetName() : undefined
    var errorValue = (errorSource && errorSource.facetName) ? errorSource.value() : undefined

    // work around raml-typesystem error output
    // https://github.com/raml-org/typesystem-ts/issues/80
    if (errorKey === 'typeOf') {
      errorKey = 'type'
    } else if (errorKey && new RegExp("^should be").test(errorKey)) {
      errorValue = errorKey.replace(/^(should be )/, '')
      errorKey = 'type'
    } else if (errorKey === 'nothing' & errorValue === '!!!') {
      errorKey = 'type'
      errorValue = 'unknown'
    }

    if (value == null) {
      return toValidationObject(isOptional, key, value, 'required', !isOptional)
    }

    return toValidationObject(result.isOk(), key, value, errorKey, errorValue)
  }
}

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
  function validate (schema, RAMLVersion) {
    if (!schema) {
      return function () {
        return { valid: true, errors: [] }
      }
    }

    // RAML version. Default to RAML 1.0.
    RAMLVersion = RAMLVersion || 'RAML10'

    var validations = {}
    var validateRule = RAMLVersion === 'RAML10' ? validate.ruleRAML10 : validate.rule

    // Convert all parameters into validation functions.
    Object.keys(schema).forEach(function (param) {
      validations[param] = validateRule(schema[param])
    })

    /**
     * The function accepts an object to be validated. All rules are already
     * precompiled.
     *
     * @param  {Object}  model
     * @return {Boolean}
     */
    return function (model) {
      model = model || {}

      // Map all validations to their object and filter for failures.
      var errors = Object.keys(validations).map(function (param) {
        var value = model[param]
        var validation = validations[param]

        // Return the validation result.
        return validation(value, param, model)
      }).filter(function (validation) {
        return !validation.valid
      })

      return {
        valid: errors.length === 0,
        errors: errors
      }
    }
  }

  /**
   * Create a singular rule validation function.
   *
   * @param  {Object}   config
   * @return {Function}
   */
  validate.rule = function rule (config) {
    return toValidation(config, validate.RULES, validate.TYPES)
  }
  validate.ruleRAML10 = function rule (config) {
    return toValidationRAML10(config)
  }

  /**
   * Provide validation of types.
   *
   * @type {Object}
   */
  validate.TYPES = {
    date: isDate,
    number: isNumber,
    integer: isInteger,
    boolean: isBoolean,
    string: isString
  }

  /**
   * Provide overridable validation of parameters.
   *
   * @type {Object}
   */
  validate.RULES = {
    minimum: isMinimum,
    maximum: isMaximum,
    minLength: isMinimumLength,
    maxLength: isMaximumLength,
    enum: isEnum,
    pattern: isPattern
  }

  /**
   * Return the validate function.
   */
  return validate
}
