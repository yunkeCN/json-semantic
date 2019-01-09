# JSON Semantic

A specification and implementation for verifying and generating(mock) JSON data.

## Example
```typescript
import { generate, htmlFormat, ObjectSchema, parse, stringify, verify } from "json-semantic";

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

// 输出
/*
{
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
*/

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
```

## schema参数
参数 | 含义 | 取值
---|---|---
__type | 类型 | `string`\|`integer`\|`float`\|`boolean`\|`array`\|`ref`
__format | 格式，当`__type`等于`string`时设置 | `cname` \| `name` \| `phone` \| `paragraph` \| `cparagraph` \| `sentence` \| `csentence` \| `word` \| `cword`\| `title` \| `ctitle` \| `hex` \| `rgb` \| `rgba` \| `hsl`\| `image` \| `dataImage` \| `date` \| `time` \| `datetime` \| `now` \| `url` \| `protocol` \| `domain` \| `email` \| `ip` \| `id` \| RegExp
__min | 最小值，当`__type`等于`integer`或`float`时表示数字最小值，当`__type`等于`array`时表示数组长度最小值 | 数字
__max | 最小值，当`__type`等于`integer`或`float`时表示数字最大值，当`__type`等于`array`时表示数组长度最大值 | 数字
__item | 数组元素 | json结构
__ratio | 几率 | 当`__type`等于`boolean`时表示`true`出现的几率
__jsonPath | [json path](https://github.com/dchester/jsonpath) | 当`__type`等于`ref`时, 取值路径, `$.self`已被内部占用
