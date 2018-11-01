import { generate, htmlFormat, ObjectSchema, parse, stringify, verify } from "./index";

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
  stringWithSchema: {
    __type: 'string',
    __format: /135\d{8}/,
  },
  stringWithSchema1: {
    __type: 'string',
    __format: 'email',
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
};

const schemaStr = stringify(testSchema);
console.info('generate: ', generate(testSchema));
console.info('parse: ', parse(schemaStr));

const jsonData = {
  "number": 1,
  "string": "string1",
  "boolean": false,
  "array": [2, 2],
  "object": { "a": 2, "b": "b" },
  "numberWithSchema": 4,
  "stringWithSchema": "13529277784",
  "stringWithSchema1": "g.edshb@zjb.eh",
  "arrayWithSchema": [{ "a": "6832" }, { "a": "56" }, { "b": "7248" }, { "a": "48" }]
};
const delta = verify(jsonData, testSchema);
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