/* global describe, it */
var util     = require('util');
var assert   = require('assert');
var validate = require('./');

/**
 * An array of all the tests to execute. Tests are in the format of:
 * ["params", "object", "valid"]
 *
 * @type {Array}
 */
var TESTS = [
  /**
   * String validation.
   */
  [{ param: { type: 'string' } }, { param: null }, true],
  [{ param: { type: 'string' } }, { param: '' }, true],
  [{ param: { type: 'string' } }, { param: 'test' }, true],
  [{ param: { type: 'string', minLength: 5 } }, { param: 'test' }, false],
  [{ param: { type: 'string', minLength: 5 } }, { param: 'testing' }, true],
  [{ param: { type: 'string', maxLength: 5 } }, { param: 'test' }, true],
  [{ param: { type: 'string', maxLength: 5 } }, { param: 'testing' }, false],
  [{ param: { type: 'string', enum: ['test'] } }, { param: 'test' }, true],
  [{ param: { type: 'string', enum: ['test'] } }, { param: 'testing' }, false],
  [{ param: { type: 'string', pattern: '^\\d+$' } }, { param: '123' }, true],
  [{ param: { type: 'string', pattern: '^\\d+$' } }, { param: 'test' }, false],
  [{ param: { type: 'string', pattern: /^\d+$/ } }, { param: '123' }, true],
  [{ param: { type: 'string', pattern: /^\d+$/ } }, { param: 'test' }, false],
  /**
   * Number validation.
   */
  [{ param: { type: 'number' } }, { param: null }, true],
  [{ param: { type: 'number' } }, { param: 123 }, true],
  [{ param: { type: 'number' } }, { param: -123 }, true],
  [{ param: { type: 'number' } }, { param: 'abc' }, false],
  [{ param: { type: 'number' } }, { param: '123' }, false],
  [{ param: { type: 'number' } }, { param: 123.123 }, true],
  [{ param: { type: 'number' } }, { param: -123.123 }, true],
  [{ param: { type: 'number', minimum: 5 } }, { param: 4 }, false],
  [{ param: { type: 'number', minimum: 5 } }, { param: 5 }, true],
  [{ param: { type: 'number', maximum: 5 } }, { param: 4.9 }, true],
  [{ param: { type: 'number', maximum: 5 } }, { param: 5.1 }, false],
  /**
   * Integer validation.
   */
  [{ param: { type: 'integer' } }, { param: null }, true],
  [{ param: { type: 'integer' } }, { param: 123 }, true],
  [{ param: { type: 'integer' } }, { param: -123 }, true],
  [{ param: { type: 'integer' } }, { param: 'abc' }, false],
  [{ param: { type: 'integer' } }, { param: '123' }, false],
  [{ param: { type: 'integer' } }, { param: 123.5 }, false],
  [{ param: { type: 'integer' } }, { param: -123.5 }, false],
  [{ param: { type: 'integer', minimum: 5 } }, { param: 5 }, true],
  [{ param: { type: 'integer', minimum: 5 } }, { param: 4 }, false],
  [{ param: { type: 'integer', maximum: 5 } }, { param: 5 }, true],
  [{ param: { type: 'integer', maximum: 5 } }, { param: 6 }, false],
  /**
   * Date validation.
   */
  [{ param: { type: 'date' } }, { param: null }, true],
  [{ param: { type: 'date' } }, { param: new Date() }, true],
  [{ param: { type: 'date' } }, { param: '123' }, false],
  /**
   * Boolean validation. This type is only used for sanitization.
   */
  [{ param: { type: 'boolean' } }, { param: null }, true],
  [{ param: { type: 'boolean' } }, { param: true }, true],
  [{ param: { type: 'boolean' } }, { param: false }, true],
  [{ param: { type: 'boolean' } }, { param: 'abc' }, false],
  [{ param: { type: 'boolean' } }, { param: '1' }, false],
  [{ param: { type: 'boolean' } }, { param: '0' }, false],
  /**
   * Required validation.
   */
  [{ param: { type: 'string', required: true } }, { param: null }, false],
  [{ param: { type: 'string', required: true } }, { param: '' }, true],
  [{ param: { type: 'string', required: true } }, { param: 'abc' }, true],
  [{ param: { type: 'integer', required: true } }, { param: null }, false],
  [{ param: { type: 'integer', required: true } }, { param: 'abc' }, false],
  [{ param: { type: 'integer', required: true } }, { param: 123 }, true],
  [{ param: { type: 'number', required: true } }, { param: null }, false],
  [{ param: { type: 'number', required: true } }, { param: 'abc' }, false],
  [{ param: { type: 'number', required: true } }, { param: 123 }, true],
  [{ param: { type: 'date', required: true } }, { param: null }, false],
  [{ param: { type: 'date', required: true } }, { param: new Date() }, true],
  /**
   * Repeated values.
   */
  [{ param: { type: 'string', repeat: true } }, { param: 'abc' }, false],
  [{ param: { type: 'string', repeat: true } }, { param: ['abc'] }, true],
  [{ param: { type: 'string', repeat: true } }, { param: ['a', 'b'] }, true],
  [{ param: { type: 'integer', repeat: true } }, { param: 123 }, false],
  [{ param: { type: 'integer', repeat: true } }, { param: [1, 2] }, true],
  [{ param: { type: 'integer', repeat: true } }, { param: [1, '2'] }, false],
  [{ param: { type: 'integer', repeat: true } }, { param: [1, 'a'] }, false],
  [{ param: { type: 'number', repeat: true } }, { param: 123.5 }, false],
  [{ param: { type: 'number', repeat: true } }, { param: [1.5, 2] }, true],
  [{ param: { type: 'number', repeat: true } }, { param: ['1.5', 2] }, false],
  [{ param: { type: 'number', repeat: true } }, { param: [1.5, 'a'] }, false],
  /**
   * Unknown types should fall back to "string".
   */
  [{ param: { type: 'unknown' } }, { param: 'abc' }, true],
  /**
   * More advanced validation use-cases.
   */
  [
    {
      tags: {
        type: 'string',
        maxLength: 20,
        repeat: true
      }
    },
    {
      tags: ['abc', '123', 'test tag', 'something else', 'yet another']
    },
    true
  ],
  [
    {
      size: {
        type: 'string',
        enum: ['small', 'medium', 'large']
      }
    },
    {
      size: 'extra large'
    },
    false
  ],
  [
    {
      username: {
        type: 'string',
        minLength: 5,
        maxLength: 20
      }
    },
    {
      username: 'something super long that breaks validation'
    },
    false
  ]
];

describe('raml-validate', function () {
  /**
   * Run through each of the defined tests to generate the test suite.
   */
  TESTS.forEach(function (test) {
    var params = test[0];
    var object = test[1];
    var valid  = test[2];

    var description = [
      util.inspect(params),
      valid ? 'should validate' : 'should not validate',
      util.inspect(object)
    ].join(' ');

    it(description, function () {
      assert.equal(validate(params)(object), valid);
    });
  });
});
