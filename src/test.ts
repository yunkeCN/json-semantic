import * as jsonpath from 'jsonpath';
import { generate, htmlFormat, parse, stringify, verify } from './index';
import { ObjectSchema } from "./types";

const testSchema: ObjectSchema = {
  number: 0,
  string: 'string',
  boolean: true,
  array: [1, 2],
  object: {
    a: 1,
    b: {
      __type: 'string',
      __format: /(a|c)/
    },
  },
  numberWithSchema: {
    __type: 'integer',
    __min: 1,
    __max: 10,
  },
  floatWithSchema: {
    __type: 'float',
    __min: 1.1,
    __max: 2.4,
  },
  floatWithSchema1: {
    __type: 'float',
    __min: 5.1524521411,
    __max: 5.1524521416,
  },
  stringWithSchema: {
    __type: 'string',
    __format: /135\d{8}/,
  },
  stringWithSchema1: {
    __type: 'string',
    __format: 'email',
  },
  stringWithSchema2: {
    __type: 'string',
  },
  stringWithSchema3: {
    __type: "string",
    __format: "/.+\\.csv$/gi"
  },
  arrayWithSchema: {
    __type: 'array',
    __min: 2,
    __max: 5,
    __item: {
      a: {
        __type: 'string',
        __format: /\d+/,
      },
    },
  },
  arrayWithSchema1: {
    __type: 'array',
    __min: 2,
    __max: 5,
    __item: {
      a: {
        __type: 'string',
        __format: /\d+/,
      },
    },
  },
  null: null,
  undefined: undefined,
  refSchema: {
    __type: 'ref',
    __jsonPath: '$.self.array[0]',
  },
  refSchemaOther: {
    __type: 'ref',
    __jsonPath: '$.other',
  },
  refSchemaNoExist: {
    __type: 'ref',
    __jsonPath: '$.other1.add',
  },
  refEnv: {
    __type: 'ref_env',
    __envid: 111,
    __templateStr: "{{parse}}"
  },
  message: {
    __type: "string",
    __format: "xx"
  },
  "set-cookie": {
    "__type": "array",
    "__min": 1,
    "__max": 10,
    "__item": {
      "__type": "string"
    }
  }
};

const schemaStr = stringify(testSchema);
const generateSchemaStr = generate(testSchema, { other: 1 });
console.info('generate: ', generateSchemaStr);
console.info('generate no mock: ', generate(testSchema, { other: 1 }, { genMock: false }));
console.info('generate no mock with resolveRef: ', generate(testSchema, { other: 1 }, {
  genMock: false,
  resolveRef: (node: { args: any; jsonPath: string; schema: any; }) => {
    if (node.schema.__jsonPath === '$.other1.add') {
      return 'resolveByCustomer';
    }
    return jsonpath.value(node.args, node.jsonPath);
  },
}));
console.info('parse: ', parse(schemaStr));

const jsonData = {
  "number": 1,
  "string": "string1",
  "boolean": false,
  "array": [2, 2],
  "object": { "a": 2, "b": "b" },
  "numberWithSchema": 4,
  "floatWithSchema": 1.2,
  "floatWithSchema1": 5.15245214119,
  "stringWithSchema": "13529277784",
  "stringWithSchema1": "g.edshb@zjb.eh",
  "stringWithSchema2": null,
  "stringWithSchema3": "4S0.csv",
  "arrayWithSchema": [{ "a": "6832" }, { "a": "56" }, { "b": "7248" }, { "a": "48" }],
  "arrayWithSchema1": null,
  "null": null,
  "undefined": "notUndefined",
  "message": "登陆成功",
  "set-cookie": [
    "aaa",
    "ddd",
    {}
  ]
};
const delta = verify(jsonData, testSchema, { other: 1 });
console.info('verify: ', delta);

if (delta) {
  console.info('visual: ', htmlFormat(delta, jsonData))
}

const test = {
  number: 0,
  string: 'string',
  boolean: true,
  array: [1, 2],
  object: { a: 1, b: 'a' },
  numberWithSchema: 7,
  stringWithSchema: '13594732735',
  stringWithSchema1: 'c.obyqwkv@sridbyh.ht',
  arrayWithSchema: [{ a: '8481' }]
}
