# RAML Validate

Strict validation of [RAML parameters](https://github.com/raml-org/raml-spec/blob/master/raml-0.8.md#named-parameters).

## Installation

```shell
npm install raml-validate
```

## Usage

```javascript
var validate = require('raml-validate');

var test = validate.rule({
  type: 'string',
  minLength: 5
});

test('abc');   //=> false
test('abcde'); //=> true

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

user({
  username: 'blakeembrey',
  password: 'super secret password'
});
//=> true
```

## License

MIT
