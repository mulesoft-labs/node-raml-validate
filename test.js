/* global describe, it */
var util = require('util')
var expect = require('chai').expect
var ramlValidate = require('./')
var validate = ramlValidate()

/**
 * An array of all the common tests to execute. Tests are in the format of:
 * ["params", "object", "valid", "errors"]
 *
 * @type {Array}
 */
var TESTS = [
  /**
   * Empty.
   */
  [
    {},
    {},
    true,
    []
  ],
  /**
   * String validation.
   */
  [
    { param: { type: 'string' } },
    { param: null },
    true,
    []
  ],
  [
    { param: { type: 'string' } },
    { param: '' },
    true,
    []
  ],
  [
    { param: { type: 'string' } },
    { param: 'test' },
    true,
    []
  ],
  [
    { param: { type: 'string', minLength: 5 } },
    { param: 'test' },
    false,
    [{ valid: false, value: 'test', key: 'param', rule: 'minLength', attr: 5 }]
  ],
  [
    { param: { type: 'string', minLength: 5 } },
    { param: 'testing' },
    true,
    []
  ],
  [
    { param: { type: 'string', maxLength: 5 } },
    { param: 'test' },
    true,
    []
  ],
  [
    { param: { type: 'string', maxLength: 5 } },
    { param: 'testing' },
    false,
    [{
      valid: false,
      value: 'testing',
      rule: 'maxLength',
      key: 'param',
      attr: 5
    }]
  ],
  [
    { param: { type: 'string', enum: ['test'] } },
    { param: 'test' },
    true,
    []
  ],
  [
    { param: { type: 'string', enum: ['test'] } },
    { param: 'testing' },
    false,
    [{
      valid: false,
      value: 'testing',
      key: 'param',
      rule: 'enum',
      attr: ['test']
    }]
  ],
  [
    { param: { type: 'string', pattern: '^\\d+$' } },
    { param: '123' },
    true,
    []
  ],
  [
    { param: { type: 'string', pattern: '^\\d+$' } },
    { param: 'test' },
    false,
    [{
      valid: false,
      rule: 'pattern',
      value: 'test',
      key: 'param',
      attr: '^\\d+$'
    }]
  ],
  [
    { param: { type: 'string', pattern: /^\d+$/ } },
    { param: '123' },
    true,
    []
  ],
  [
    { param: { type: 'string', pattern: /^\d+$/ } },
    { param: 'test' },
    false,
    [{
      valid: false,
      rule: 'pattern',
      value: 'test',
      key: 'param',
      attr: /^\d+$/
    }]
  ],
  /**
   * Number validation.
   */
  [
    { param: { type: 'number' } },
    { param: null },
    true,
    []
  ],
  [
    { param: { type: 'number' } },
    { param: 123 },
    true,
    []
  ],
  [
    { param: { type: 'number' } },
    { param: -123 },
    true,
    []
  ],
  [
    { param: { type: 'number' } },
    { param: 'abc' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 'abc',
      key: 'param',
      attr: 'number'
    }]
  ],
  [
    { param: { type: 'number' } },
    { param: '123' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: '123',
      key: 'param',
      attr: 'number'
    }]
  ],
  [
    { param: { type: 'number' } },
    { param: 123.123 },
    true,
    []
  ],
  [
    { param: { type: 'number' } },
    { param: -123.123 },
    true,
    []
  ],
  [
    { param: { type: 'number', minimum: 5 } },
    { param: 4 },
    false,
    [{ valid: false, rule: 'minimum', value: 4, key: 'param', attr: 5 }]
  ],
  [
    { param: { type: 'number', minimum: 5 } },
    { param: 5 },
    true,
    []
  ],
  [
    { param: { type: 'number', maximum: 5 } },
    { param: 4.9 },
    true,
    []
  ],
  [
    { param: { type: 'number', maximum: 5 } },
    { param: 5.1 },
    false,
    [{ valid: false, rule: 'maximum', value: 5.1, key: 'param', attr: 5 }]
  ],
  /**
   * Integer validation.
   */
  [
    { param: { type: 'integer' } },
    { param: null },
    true,
    []
  ],
  [
    { param: { type: 'integer' } },
    { param: 123 },
    true,
    []
  ],
  [
    { param: { type: 'integer' } },
    { param: -123 },
    true,
    []
  ],
  [
    { param: { type: 'integer' } },
    { param: 'abc' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 'abc',
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    { param: { type: 'integer' } },
    { param: '123' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: '123',
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    { param: { type: 'integer' } },
    { param: 123.5 },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 123.5,
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    { param: { type: 'integer' } },
    { param: -123.5 },
    false,
    [{
      valid: false,
      rule: 'type',
      value: -123.5,
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    { param: { type: 'integer', minimum: 5 } },
    { param: 5 },
    true,
    []
  ],
  [
    { param: { type: 'integer', minimum: 5 } },
    { param: 4 },
    false,
    [{ valid: false, rule: 'minimum', value: 4, key: 'param', attr: 5 }]
  ],
  [
    { param: { type: 'integer', maximum: 5 } },
    { param: 5 },
    true,
    []
  ],
  [
    { param: { type: 'integer', maximum: 5 } },
    { param: 6 },
    false,
    [{ valid: false, rule: 'maximum', value: 6, key: 'param', attr: 5 }]
  ],
  /*
   * Boolean validation. This type is only used for sanitization.
   */
  [
    { param: { type: 'boolean' } },
    { param: null },
    true,
    []
  ],
  [
    { param: { type: 'boolean' } },
    { param: true },
    true,
    []
  ],
  [
    { param: { type: 'boolean' } },
    { param: false },
    true,
    []
  ],
  [
    { param: { type: 'boolean' } },
    { param: 'abc' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 'abc',
      key: 'param',
      attr: 'boolean'
    }]
  ],
  [
    { param: { type: 'boolean' } },
    { param: '1' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: '1',
      key: 'param',
      attr: 'boolean'
    }]
  ],
  [
    { param: { type: 'boolean' } },
    { param: '0' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: '0',
      key: 'param',
      attr: 'boolean'
    }]
  ],
  /**
   * Required validation.
   */
  [
    { param: { type: 'string', required: true } },
    { param: null },
    false,
    [{
      valid: false,
      rule: 'required',
      value: null,
      key: 'param',
      attr: true
    }]
  ],
  [
    { param: { type: 'string', required: true } },
    { param: '' },
    true,
    []
  ],
  [
    { param: { type: 'string', required: true } },
    { param: 'abc' },
    true,
    []
  ],
  [
    { param: { type: 'integer', required: true } },
    { param: null },
    false,
    [{ valid: false, rule: 'required', value: null, key: 'param', attr: true }]
  ],
  [
    { param: { type: 'integer', required: true } },
    { param: 'abc' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 'abc',
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    { param: { type: 'integer', required: true } },
    { param: 123 },
    true,
    []
  ],
  [
    { param: { type: 'number', required: true } },
    { param: null },
    false,
    [{
      valid: false,
      rule: 'required',
      value: null,
      key: 'param',
      attr: true
    }]
  ],
  [
    { param: { type: 'number', required: true } },
    { param: 'abc' },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 'abc',
      key: 'param',
      attr: 'number'
    }]
  ],
  [
    { param: { type: 'number', required: true } },
    { param: 123 },
    true,
    []
  ],
  /**
   * More advanced validation use-cases.
   */
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
    false,
    [{
      valid: false,
      rule: 'enum',
      value: 'extra large',
      key: 'size',
      attr: ['small', 'medium', 'large']
    }]
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
    false,
    [{
      valid: false,
      rule: 'maxLength',
      value: 'something super long that breaks validation',
      key: 'username',
      attr: 20
    }]
  ],
  /**
   * Multiple validation errors.
   */
  [
    {
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
    },
    {
      username: 'abc',
      password: '123'
    },
    false,
    [
      {
        valid: false,
        rule: 'minLength',
        value: 'abc',
        key: 'username',
        attr: 5
      },
      {
        valid: false,
        rule: 'minLength',
        value: '123',
        key: 'password',
        attr: 5
      }
    ]
  ],
  /**
   * Unknown types should be invalid.
   */
  [
    {
      param: {
        type: 'unknown'
      }
    },
    {
      param: 'abc'
    },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 'abc',
      key: 'param',
      attr: 'unknown'
    }]
  ]
]

/**
 * An array of RAML 1.0 -specific tests.
 *
 * @type {Array}
 */
var RAML10TESTS = [
  /**
   * Date types.
   */
  [
    {
      date: {
        type: 'date-only'
      }
    },
    {
      date: '2016-10-07'
    },
    true,
    []
  ],
  [
    {
      date: {
        type: 'date-only'
      }
    },
    {
      date: '2016-10-07T21:00:00'
    },
    false,
    [{
      'attr': 'date-only',
      'key': 'date',
      'rule': 'type',
      'valid': false,
      'value': '2016-10-07T21:00:00'
    }]
  ],
  [
    {
      date: {
        type: 'time-only'
      }
    },
    {
      date: '12:30:00'
    },
    true,
    []
  ],
  [
    {
      date: {
        type: 'time-only'
      }
    },
    {
      date: '2016-10-07T21:00:00'
    },
    false,
    [{
      'attr': 'time-only',
      'key': 'date',
      'rule': 'type',
      'valid': false,
      'value': '2016-10-07T21:00:00'
    }]
  ],
  [
    {
      date: {
        type: 'datetime-only'
      }
    },
    {
      date: '2016-10-07T21:00:00'
    },
    true,
    []
  ],
  [
    {
      date: {
        type: 'datetime-only'
      }
    },
    {
      date: '2016-10-07'
    },
    false,
    [{
      'attr': 'datetime-only',
      'key': 'date',
      'rule': 'type',
      'valid': false,
      'value': '2016-10-07'
    }]
  ],
  [
    {
      date: {
        type: 'datetime' // default format: rfc3339
      }
    },
    {
      date: '2016-02-28T16:41:41.090Z'
    },
    true,
    []
  ],
  // [
  //   {
  //     date: {
  //       type: ['datetime']
  //     }
  //   },
  //   {
  //     date: 'Sun, 28 Feb 2016 16:41:41 GMT'
  //   },
  //   false,
  //   [{
  //     'attr': 'datetime',
  //     'key': 'date',
  //     'rule': 'type',
  //     'valid': false,
  //     'value': 'Sun, 28 Feb 2016 16:41:41 GMT'
  //   }]
  // ],
  [
    {
      date: {
        type: 'datetime',
        format: 'rfc2616'
      }
    },
    {
      date: 'Sun, 28 Feb 2016 16:41:41 GMT'
    },
    true,
    []
  ],
  // [
  //   {
  //     date: {
  //       type: ['datetime'],
  //       format: 'rfc2616'
  //     }
  //   },
  //   {
  //     date: '2016-02-28T16:41:41.090Z'
  //   },
  //   false,
  //   [{
  //     'attr': 'datetime',
  //     'key': 'date',
  //     'rule': 'type',
  //     'valid': false,
  //     'value': '2016-02-28T16:41:41.090Z'
  //   }]
  // ],
  /**
   * Union type.
   */
  [
    {
      param: {
        type: 'string | integer'
      }
    },
    {
      param: 123
    },
    true,
    []
  ],
  [
    {
      param: {
        type: 'string | integer'
      }
    },
    {
      param: 'test'
    },
    true,
    []
  ],
  // [
  //   {
  //     param: {
  //       type: 'string | integer'
  //     }
  //   },
  //   {
  //     param: 123.5
  //   },
  //   false,
  //   [{
  //     valid: false,
  //     rule: 'type',
  //     value: 123.5,
  //     key: 'param',
  //     attr: 'integer'
  //   }]
  // ],
  /**
   * Array type
   */
  [
    {
      param: {
        type: 'array',
        minItems: 2,
        maxItems: 4
      }
    },
    {
      param: ['a', 'b', 'c', 'd']
    },
    true,
    []
  ],
  [
    {
      param: {
        type: 'array',
        minItems: 2,
        maxItems: 4
      }
    },
    {
      param: ['a']
    },
    false,
    [{
      attr: 2,
      key: 'param',
      rule: 'minItems',
      valid: false,
      value: ['a']
    }]
  ],
  [
    {
      param: {
        type: 'array',
        minItems: 2,
        maxItems: 4
      }
    },
    {
      param: ['a', 'b', 'c', 'd', 'e']
    },
    false,
    [{
      attr: 4,
      key: 'param',
      rule: 'maxItems',
      valid: false,
      value: ['a', 'b', 'c', 'd', 'e']
    }]
  ],
  [
    {
      param: {
        type: 'array',
        items: 'integer'
      }
    },
    {
      param: [1]
    },
    true,
    []
  ],
  [
    {
      param: {
        type: 'array',
        items: 'integer'
      }
    },
    {
      param: ['a']
    },
    false,
    [{
      attr: 'integer',
      key: 'param',
      rule: 'type',
      valid: false,
      value: ['a']
    }]
  ],
  /**
   * Type expression
   */
  [
    {
      param: {
        type: 'string[]'
      }
    },
    {
      param: ['a', 'b', 'c']
    },
    true,
    []
  ],
  [
    {
      param: {
        type: 'string[]'
      }
    },
    {
      param: 'a'
    },
    false,
    [{
      attr: 'array',
      key: 'param',
      rule: 'type',
      valid: false,
      value: 'a'
    }]
  ],
  [
    {
      param: {
        type: 'string[][]'
      }
    },
    {
      param: [['a', 'b', 'c'], ['d', 'e', 'f']]
    },
    true,
    []
  ],
  [
    {
      param: {
        type: '(string[] | integer[])[]'
      }
    },
    {
      param: [['a', 'b', 'c'], [1, 2, 3]]
    },
    true,
    []
  ],
  /**
   * Enum
   */
  [
    {
      clearanceLevel: {
        type: 'string',
        enum: ['low', 'high']
      }
    },
    {
      clearanceLevel: 'high'
    },
    true,
    []
  ],
  [
    {
      clearanceLevel: {
        type: 'string',
        enum: ['low', 'high']
      }
    },
    {
      clearanceLevel: 'unknown'
    },
    false,
    [{
      attr: [
        'low',
        'high'
      ],
      key: 'clearanceLevel',
      rule: 'enum',
      valid: false,
      value: 'unknown'
    }]
  ],
  /**
   * datatype-expansion's 'union' type
   */
  [
    {
      param: {
        type: 'union',
        anyOf: [
          { type: 'string' },
          {
            type: 'integer',
            maximum: 100
          }
        ]
      }
    },
    {
      param: 'foo'
    },
    true,
    []
  ],
  [
    {
      param: {
        type: 'union',
        anyOf: [
          { type: 'string' },
          {
            type: 'integer',
            maximum: 100
          }
        ]
      }
    },
    {
      param: 42
    },
    true,
    []
  ],
  [
    {
      param: {
        type: 'union',
        anyOf: [
          { type: 'string' },
          {
            type: 'integer',
            maximum: 100
          }
        ]
      }
    },
    {
      param: 101
    },
    false,
    [{
      attr: 'invalid union type',
      key: 'param',
      rule: 'union type',
      valid: false,
      value: 101
    }]
  ],
  [
    {
      param: {
        type: 'union',
        anyOf: [
          { type: 'string' },
          {
            type: 'integer',
            maximum: 100
          }
        ]
      }
    },
    {
      param: true
    },
    false,
    [{
      attr: 'invalid union type',
      key: 'param',
      rule: 'union type',
      valid: false,
      value: true
    }]
  ],
  /**
   * Non-object root elements
   */
  [
    {
      type: 'array',
      items: 'integer'
    },
    [ 1, 2, 3 ],
    true,
    []
  ],
  [
    {
      type: 'array',
      items: 'integer'
    },
    [ 'a', 'b', 'c' ],
    false,
    [
      {
        attr: 'integer',
        key: undefined,
        rule: 'type',
        valid: false,
        value: [
          'a',
          'b',
          'c'
        ]
      }
    ]
  ],
  [
    {
      type: 'array',
      items: 'integer'
    },
    'a',
    false,
    [
      {
        attr: 'array',
        key: undefined,
        rule: 'type',
        valid: false,
        value: 'a'
      }
    ]
  ],
  [
    {
      type: 'array',
      items: 'integer'
    },
    7,
    false,
    [
      {
        attr: 'array',
        key: undefined,
        rule: 'type',
        valid: false,
        value: 7
      }
    ]
  ],
  [
    {
      type: 'array',
      items: 'object'
    },
    [ {}, {}, {} ],
    true,
    []
  ],
  [
    {
      type: 'array',
      items: 'object'
    },
    [ 'a', 'b', 'c' ],
    false,
    [
      {
        attr: 'object',
        key: undefined,
        rule: 'type',
        valid: false,
        value: [
          'a',
          'b',
          'c'
        ]
      }
    ]
  ],
  [
    { type: 'integer' },
    7,
    true,
    []
  ],
  [
    { type: 'integer' },
    'a',
    false,
    [
      {
        attr: 'integer',
        key: undefined,
        rule: 'type',
        valid: false,
        value: 'a'
      }
    ]
  ],
  [
    { type: 'string' },
    'a',
    true,
    []
  ],
  [
    { type: 'string' },
    7,
    false,
    [
      {
        attr: 'string',
        key: undefined,
        rule: 'type',
        valid: false,
        value: 7
      }
    ]
  ],
  /**
   * Special cases
   */
  [
    { param: { type: 'boolean' } },
    { param: ['abc'] },
    false,
    [{
      attr: 'boolean',
      key: 'param',
      rule: 'type',
      valid: false,
      value: ['abc']
    }]
  ],
  [
    {
      type: ['object'],
      properties: {} // Object with no properties defined
    },
    {},
    true,
    []
  ],
  [
    {
      type: 'object',
      properties: {}
    },
    [],
    false,
    [
      {
        attr: 'object',
        key: undefined,
        rule: 'type',
        valid: false,
        value: []
      }
    ]
  ]
]
/**
 * An array of RAML 0.8 -specific tests.
 *
 * @type {Array}
 */
var RAML08TESTS = [
  /**
   * Date validation.
   */
  [
    { param: { type: 'date' } },
    { param: null },
    true,
    []
  ],
  [
    { param: { type: 'date' } },
    { param: new Date() },
    true,
    []
  ],
  [
    { param: { type: 'date' } },
    { param: '123' },
    false,
    [{ valid: false, rule: 'type', value: '123', key: 'param', attr: 'date' }]
  ],
  [
    { param: { type: 'date' } },
    { param: new Date('abc') },
    false,
    [{
      valid: false,
      rule: 'type',
      value: new Date('abc'),
      key: 'param',
      attr: 'date'
    }]
  ],
  /**
   * Required validation.
   */
  [
    { param: { type: 'date', required: true } },
    { param: null },
    false,
    [{
      valid: false,
      rule: 'required',
      value: null,
      key: 'param',
      attr: true
    }]
  ],
  [
    { param: { type: 'date', required: true } },
    { param: new Date() },
    true,
    []
  ],
  /**
   * Repeated values.
   */
  [
    { param: { type: 'string', repeat: true } },
    { param: 'abc' },
    false,
    [{ valid: false, rule: 'repeat', value: 'abc', key: 'param', attr: true }]
  ],
  [
    { param: { type: 'string', repeat: true } },
    { param: ['abc'] },
    true,
    []
  ],
  [
    { param: { type: 'string', repeat: true } },
    { param: ['a', 'b'] },
    true,
    []
  ],
  [
    { param: { type: 'integer', repeat: true } },
    { param: 123 },
    false,
    [{ valid: false, rule: 'repeat', value: 123, key: 'param', attr: true }]
  ],
  [
    { param: { type: 'integer', repeat: true } },
    { param: [1, 2] },
    true,
    []
  ],
  [
    { param: { type: 'integer', repeat: true } },
    { param: [1, '2'] },
    false,
    [{
      valid: false,
      rule: 'type',
      value: [1, '2'],
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    { param: { type: 'integer', repeat: true } },
    { param: [1, 'a'] },
    false,
    [{
      valid: false,
      rule: 'type',
      value: [1, 'a'],
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    { param: { type: 'number', repeat: true } },
    { param: 123.5 },
    false,
    [{
      valid: false,
      rule: 'repeat',
      value: 123.5,
      key: 'param',
      attr: true
    }]
  ],
  [
    { param: { type: 'number', repeat: true } },
    { param: [1.5, 2] },
    true,
    []
  ],
  [
    { param: { type: 'number', repeat: true } },
    { param: ['1.5', 2] },
    false,
    [{
      valid: false,
      rule: 'type',
      value: ['1.5', 2],
      key: 'param',
      attr: 'number'
    }]
  ],
  [
    { param: { type: 'number', repeat: true } },
    { param: [1.5, 'a'] },
    false,
    [{
      valid: false,
      rule: 'type',
      value: [1.5, 'a'],
      key: 'param',
      attr: 'number'
    }]
  ],
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
    true,
    []
  ],
  /**
   * Multiple types with repeat support.
   */
  [
    {
      param: [
        {
          type: 'string',
          repeat: true
        },
        {
          type: 'integer'
        }
      ]
    },
    {
      param: 'test'
    },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 'test',
      key: 'param',
      attr: 'integer'
    }]
  ],
  [
    {
      param: [
        {
          type: 'string',
          repeat: true
        },
        {
          type: 'integer'
        }
      ]
    },
    {
      param: [123]
    },
    false,
    [{
      valid: false,
      rule: 'type',
      value: [123],
      key: 'param',
      attr: 'string'
    }]
  ],
  [
    {
      param: [
        {
          type: 'string',
          repeat: true
        },
        {
          type: 'integer'
        }
      ]
    },
    {
      param: ['test']
    },
    true,
    []
  ],
  [
    {
      param: [
        {
          type: 'string',
          repeat: true
        },
        {
          type: 'integer'
        }
      ]
    },
    {
      param: 123
    },
    true,
    []
  ],
  /**
   * Multiple validation types.
   */
  [
    {
      param: [
        {
          type: 'string'
        },
        {
          type: 'integer'
        }
      ]
    },
    {
      param: 123
    },
    true,
    []
  ],
  [
    {
      param: [
        {
          type: 'string'
        },
        {
          type: 'integer'
        }
      ]
    },
    {
      param: 'test'
    },
    true,
    []
  ],
  [
    {
      param: [
        {
          type: 'string'
        },
        {
          type: 'integer'
        }
      ]
    },
    {
      param: 123.5
    },
    false,
    [{
      valid: false,
      rule: 'type',
      value: 123.5,
      key: 'param',
      attr: 'integer'
    }]
  ],
  /**
   * Regressions.
   */
  [
    {
      param: {
        type: 'string',
        repeat: true,
        required: false
      }
    },
    { param: [] },
    true,
    []
  ],
  /**
   * Special cases
   */
  [
    { param: { type: 'boolean' } },
    { param: ['abc'] },
    false,
    [{
      valid: false,
      rule: 'repeat',
      value: ['abc'],
      key: 'param',
      attr: false
    }]
  ]
]

describe('raml-validate', function () {
  describe('functional tests (RAML 1.0)', function () {
    /**
     * Run through each of the defined tests to generate the test suite.
     */
    TESTS.concat(RAML10TESTS).forEach(function (test) {
      var params = test[0]
      var object = test[1]
      var valid = test[2]
      var errors = test[3]

      var description = [
        util.inspect(params),
        valid ? 'should validate' : 'should not validate',
        util.inspect(object)
      ].join(' ')

      it(description, function () {
        var validity = validate(params, 'RAML10')(object)

        expect(validity.valid).to.equal(valid)
        // skipping error check until https://github.com/raml-org/typesystem-ts/issues/80
        // is resolved
        expect(validity.errors).to.deep.equal(errors)
      })
    })
  })

  describe('functional tests (RAML 0.8)', function () {
    /**
     * Run through each of the defined tests to generate the test suite.
     */
    TESTS.concat(RAML08TESTS).forEach(function (test) {
      var params = test[0]
      var object = test[1]
      var valid = test[2]
      var errors = test[3]

      var description = [
        util.inspect(params),
        valid ? 'should validate' : 'should not validate',
        util.inspect(object)
      ].join(' ')

      it(description, function () {
        var validity = validate(params, 'RAML08')(object)

        expect(validity.valid).to.equal(valid)
        expect(validity.errors).to.deep.equal(errors)
      })
    })
  })

  describe('pluginable', function () {
    it('should be able to add a new type validation (RAML 0.8)', function () {
      // Attach a dummy type.
      validate.TYPES.test = function (value) {
        return value === 'test'
      }

      // Create a test schema using our new type.
      var schema = validate({
        param: {
          type: 'test'
        }
      }, 'RAML08')

      // Assert the type validation is actually working.
      expect(schema({ param: 'test' }).valid).to.be.true
      expect(schema({ param: 'testing' }).valid).to.be.false
    })

    it('should be able to add a new validation rule (RAML 0.8)', function () {
      // Attach `requires` validation to the current validate instance.
      validate.RULES.requires = function (property) {
        return function (value, key, object) {
          return value != null && object[property] != null
        }
      }

      // Create a test schema.
      var schema = validate({
        lat: {
          type: 'string',
          requires: 'lng'
        },
        lng: {
          type: 'string',
          requires: 'lat'
        }
      }, 'RAML08')

      // Assert our models validate as expected.
      expect(schema({}).valid).to.be.true
      expect(schema({ lng: '123' }).valid).to.be.false
      expect(schema({ lng: '123' }).valid).to.be.false
      expect(schema({ lat: '123', lng: '123' }).valid).to.be.true
    })

    it('should only add rules to a single instance', function () {
      validate.TYPES.test = function () {}
      validate.RULES.test = function () {}

      var newValidate = ramlValidate()

      expect(newValidate.TYPES.test).to.not.exist
      expect(newValidate.RULES.test).to.not.exist
    })
  })
})
