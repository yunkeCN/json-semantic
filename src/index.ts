import * as jsondiffpatch from "jsondiffpatch";
import { Delta, DiffContext } from "jsondiffpatch";
import * as mockjs from "mockjs";
import HtmlFormatter from "./HtmlFormatter";

const htmlFormatter = new HtmlFormatter();

export interface NumberSchema {
  __type: 'integer' | 'float';
  __min: number;
  __max: number;
}

export interface BooleanSchema {
  __type: 'boolean';
  __ratio: number;
}

export type TFormat = 'cname' | 'name' | 'phone'
  | 'paragraph' | 'cparagraph' | 'sentence' | 'csentence' | 'word' | 'cword'
  | 'title' | 'ctitle' | 'hex' | 'rgb' | 'rgba' | 'hsl'
  | 'image' | 'dataImage' | 'date' | 'time' | 'datetime' | 'now'
  | 'url' | 'protocol' | 'domain' | 'email' | 'ip' | 'id' | RegExp;

const REG_MAP: { [key: string]: RegExp } = {
  cname: /[\u4e00-\u9fa5]+/,
  name: /[\w\s\.]+/,
  email: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
  phone: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
  paragraph: /.+/,
  cparagraph: /.+/,
  sentence: /.+/,
  csentence: /.+/,
  word: /\w+/,
  cword: /[\u4e00-\u9fa5]+/,
  title: /.+/,
  ctitle: /.+/,
  hex: /^#[\w\d]{6}/,
  rgb: /rgb\(\d{3},\s+\d{3},\s+\d{3}\)/,
  rgba: /rgba\(\d{3},\s+\d{3},\s+\d{3}\,\s+.+\)/,
  hsl: /.+/,
  image: /.+/,
  dataImage: /.+/,
  date: /.+/,
  time: /.+/,
  datetime: /.+/,
  now: /.+/,
  url: /.+/,
  protocol: /.+/,
  domain: /.+/,
  ip: /((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/,
  id: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
};

export interface StringSchema {
  __type: 'string';
  __format?: TFormat;
  __min?: number;
  __max?: number;
}

export interface ArraySchema {
  __type: 'array';
  __min: number;
  __max: number;
  __item: ValueType;
}

export type ValueTypeExcludeArray = number | string | boolean | ObjectSchema |
  NumberSchema | BooleanSchema | StringSchema | ArraySchema | void;

export type ValueType = ValueTypeExcludeArray | ValueTypeExcludeArray[];

export interface ObjectSchema {
  [key: string]: ValueType;

  __type?: never;
  __min?: never;
  __max?: never;
  __item?: never;
  __format?: never;
  __ratio?: never;
}


function isNumber(val: any): boolean {
  return typeof val === 'number';
}

function isString(val: any): boolean {
  return typeof val === 'string';
}

function isBoolean(val: any): boolean {
  return typeof val === 'boolean';
}

function isUndefined(val: any): boolean {
  return typeof val === 'undefined';
}

export function convertToMockJsTemplate(
  schema: ObjectSchema | number | boolean | string | undefined | any[],
  path = '',
): {
  template: any,
  rule?: string,
  ruleMap?: { [path: string]: any },
} {
  const isNum = isNumber(schema);
  const isStr = isString(schema);
  const isBool = isBoolean(schema);
  const isUndef = isUndefined(schema);

  const ruleMap: { [path: string]: any } = {};

  if (isNum || isStr || isBool || isUndef) {
    return { template: schema };
  }

  const schema1 = schema as ObjectSchema;

  const type = schema1.__type;

  if (!type) {
    const isArr = Object.prototype.toString.call(schema1) === '[object Array]';
    if (isArr) {
      const clone: any[] = (schema as any[]).map((schemaValue, index) => {
        const {
          template,
          ruleMap: ruleMapNested,
        } = convertToMockJsTemplate(schemaValue as ObjectSchema, `${path}.${index}`);
        if (ruleMapNested) {
          Object.assign(ruleMap, ruleMapNested);
        }
        return template;
      });
      return { template: clone, ruleMap };
    } else {
      const clone: any = {};
      Object.keys(schema1).forEach((key) => {
        const schemaValue = schema1[key];
        const {
          template,
          ruleMap: ruleMapNested,
        } = convertToMockJsTemplate(schemaValue as ObjectSchema, `${path}.${key}`);
        if (ruleMapNested) {
          Object.assign(ruleMap, ruleMapNested);
        }
        clone[key] = template;
      });
      return { template: clone, ruleMap };
    }
  }

  ruleMap[`${path}`] = schema1;
  const { __format: format, __max: max, __min: min, __ratio: ratio, __item: item } = schema1;

  switch (type) {
    case 'integer':
      ruleMap[`${path}`] = schema1;
      return { template: `@integer(${min}, ${max})`, ruleMap };
    case 'float':
      ruleMap[`${path}`] = schema1;
      return { template: `@float(${min}, ${max})`, ruleMap };
    case 'boolean':
      ruleMap[`${path}`] = schema1;
      return { template: `@boolean(${ratio}, 1)`, ruleMap };
    case 'string':
      if (typeof format === 'string') {
        return { template: `@${format}`, ruleMap };
      }
      return { template: format, ruleMap };
    case 'array':
      const {
        template,
        ruleMap: ruleMapNested,
      } = convertToMockJsTemplate(item, `${path}.[]`);
      if (ruleMapNested) {
        Object.assign(ruleMap, ruleMapNested);
      }
      return {
        template: [template],
        rule: `${typeof min === 'undefined' ? '' : min}-${typeof max === 'undefined' ? '' : max}`,
        ruleMap,
      };
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

const regExp = /regexp____(.+)____(.+)?/;

export function stringify(schema: any): any {
  return JSON.stringify(schema, (key: string, value: any) => {
    if (value instanceof RegExp) {
      return `regexp____${value.source}____${value.flags}`;
    }
    return value;
  });
}

export function parse(schemaStr: string): any {
  return JSON.parse(schemaStr, (key: any, value: any) => {
    let exec;
    if (typeof value === 'string' && (exec = regExp.exec(value))) {
      return new RegExp(exec[1], exec[2]);
    }
    return value;
  })
}

export function generate(schema: ObjectSchema): any {
  return mockjs.mock(convertToMockJsTemplate(schema).template);
}

const diffFilter = function(context: DiffContext) {
  if (!context.right) {
    return;
  }

  const type = context.right.__type;
  if (type) {
    const { __format: format } = (context.right as any);
    if (type === 'string') {
      if (format instanceof RegExp) {
        if ((format as RegExp).test(context.left as string)) {
          (context as any).setResult(undefined).exit();
          return;
        }
      } else {
        const reg = REG_MAP[format];
        if (reg) {
          if (reg.test(context.left)) {
            (context as any).setResult([context.right, context.left]).exit();
          } else {
            (context as any).setResult(undefined).exit();
          }
          return;
        } else {
          throw new Error(`Unsupported format: ${format}`);
        }
      }
    } else if (type === 'float') {
      if (/^\d+\.\d+$/.test(context.left as string)) {
        (context as any).setResult(undefined).exit();
      } else {
        (context as any).setResult([context.right, context.left]).exit();
      }
    } else if (type === 'integer') {
      if (/^\d+$/.test(context.left as string)) {
        (context as any).setResult(undefined).exit();
      } else {
        (context as any).setResult([context.right, context.left]).exit();
      }
    } else if (type === 'array') {
      const leftArr = context.left as any[];
      const rightArr = leftArr.map(() => context.right.__item);
      (context as any).setResult(getDiffPatcher().diff(leftArr, rightArr)).exit();
      return;
    }
  }
};
// a filterName is useful if I want to allow other filters to be inserted before/after this one
(diffFilter as any).filterName = 'json-semantic';

export function getDiffPatcher() {
  const diffPatcher = new jsondiffpatch.DiffPatcher();
  (diffPatcher as any).processor.pipes.diff.before('trivial', diffFilter);
  return diffPatcher;
}

export function verify(jsonData: any, schema: ObjectSchema): Delta | undefined {
  return getDiffPatcher().diff(jsonData, schema);
}

export function htmlFormat(delta: Delta, schema: any): string {
  return htmlFormatter.format(delta, schema);
}