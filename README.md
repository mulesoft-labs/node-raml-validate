# RAML Validate

Strict and pluginable validation of [RAML parameters](https://github.com/raml-org/raml-spec/blob/master/raml-0.8.md#named-parameters).

## Installation

```shell
npm install raml-validate --save
```

## Usage

You must require the module and call it as a function to get a validation instance back.

```javascript
var validate = require('raml-validate')();

// Create a user model schema.
var user = validate({
  username: {
    type: 'string',
    minLength: 5,
    maxLength: 50,
    required: true
  },
  password: {
    type: 'string',
    minLength: 5,
    maxLength: 50,
    required: true
  }
});

// Validate a user model.
user({
  username: 'blakeembrey',
  password: 'super secret password'
}); //=> { valid: true, errors: [] }
```

### Getting validation errors

All validation errors can be retrieved from the `errors` property on the returned object. If `valid === false`, the errors will be set to an array. This can be useful for generating error messages for the client.

```javascript
[{ rule: 'minLength', value: 'test', key: 'password' }]
```

### Adding new types

New type validations can be added by setting the corresponding property on the `validate.TYPES` object. For example, file validation to support only buffers maybe added by doing:

```javascript
validate.TYPES.file = function (value) {
  return Buffer.isBuffer(value);
};
```

The function must accept the value as the first parameter and return a boolean depending on success or failure.

### Adding new rules

New rules can be added by setting the corresponding property on the `validate.RULES` object. For example, to add file size support we can do the following:

```javascript
validate.RULES.minFileSize = function (size) {
  return function (value) {
    return value.length <= size;
  };
};
```

The function must accept the validation value as its only parameter and is expected to return another function that implements the validation logic. The returned function must accept the value as the first argument, and can optionally accept the key and model as the second and third arguments. This is useful for implementing a rule such as `requires`, where both parameters may be optional; however, when set, depend on eachother being set.

```javascript
validate.RULES.requires = function (property) {
  return function (value, key, object) {
    return value != null && object[property] != null;
  };
};
```

## License

Apache 2.0
