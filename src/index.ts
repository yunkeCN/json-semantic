import * as jsondiffpatch from "jsondiffpatch";
import { Delta, DiffContext } from "jsondiffpatch";
import * as jsonpath from 'jsonpath';
import * as mockjs from "mockjs";
import HtmlFormatter from "./HtmlFormatter";
import { ObjectSchema } from './types';

export {
  ObjectSchema,
  StringSchema,
  BooleanSchema,
  NumberSchema,
  ArraySchemaWithGenerics,
  ArraySchema,
} from "./types";

const htmlFormatter = new HtmlFormatter();

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
  image: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
  dataImage: /.+/,
  date: /.+/,
  time: /.+/,
  datetime: /.+/,
  now: /.+/,
  url: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
  protocol: /(https?|ftp):/,
  domain: /.+/,
  ip: /((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/,
  id: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
};

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

function isArray(val: any): boolean {
  return Object.prototype.toString.call(val) === '[object Array]';
}

export function convertToMockJsTemplate(options: {
  schema: ObjectSchema | number | boolean | string | undefined | any[];
  args?: any;
  path?: string
}): {
  template: any,
  rule?: string,
} {
  const { schema, path = '' } = options;

  let { args = {} } = options;

  if (!path) {
    args = { ...args, self: schema };
  }

  const isNum = isNumber(schema);
  const isStr = isString(schema);
  const isBool = isBoolean(schema);
  const isUndef = isUndefined(schema);

  if (isNum || isStr || isBool || isUndef) {
    return { template: schema };
  }

  const schema1 = schema as ObjectSchema;

  const type = schema1.__type;

  if (!type) {
    if (isArray(schema1)) {
      const clone: any[] = (schema as any[]).map((schemaValue, index) => {
        const {
          template,
        } = convertToMockJsTemplate({
          schema: schemaValue as ObjectSchema,
          path: `${path}.${index}`,
          args,
        });
        return template;
      });
      return { template: clone };
    } else {
      const clone: any = {};
      Object.keys(schema1).forEach((key) => {
        const schemaValue = schema1[key];
        const {
          template,
        } = convertToMockJsTemplate({
          schema: schemaValue as ObjectSchema,
          path: `${args}.${key}`,
          args,
        });
        clone[key] = template;
      });
      return { template: clone };
    }
  }

  const {
    __format: format,
    __max: max,
    __min: min,
    __ratio: ratio,
    __item: item,
    __jsonPath: jsonPath,
  } = schema1;

  switch (type) {
    case 'integer':
      return { template: `@integer(${min}, ${max})` };
    case 'float':
      return { template: `@float(${min}, ${max})` };
    case 'boolean':
      return { template: `@boolean(${ratio}, 1)` };
    case 'string':
      if (typeof format === 'string') {
        return { template: `@${format}` };
      }
      return { template: format };
    case 'array':
      const {
        template,
      } = convertToMockJsTemplate({
        schema: item,
        args,
        path: `${path}.[]`,
      });
      return {
        template: [template],
        rule: `${typeof min === 'undefined' ? '' : min}-${typeof max === 'undefined' ? '' : max}`,
      };
    case 'ref':
      if (!jsonPath) {
        throw new Error(`__jsonPath must specified when __type is ref`);
      }
      const query = jsonpath.value(args, jsonPath);
      const {
        template: templateRef,
      } = convertToMockJsTemplate({
        schema: query,
        args,
        path,
      });
      return {
        template: templateRef,
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

export function generate(schema: ObjectSchema, args: any): any {
  return mockjs.mock(convertToMockJsTemplate({
    schema,
    args
  }).template);
}

const makeDiffFilter = (refData: any) => function(context: DiffContext) {
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
        } else {
          (context as any).setResult([context.left, context.right]).exit();
        }
      } else {
        const reg = REG_MAP[format];
        if (reg) {
          if (reg.test(context.left)) {
            (context as any).setResult(undefined).exit();
          } else {
            (context as any).setResult([context.left, context.right]).exit();
          }
        } else {
          throw new Error(`Unsupported format: ${format}`);
        }
      }
    } else if (type === 'float') {
      if (/^-?\d+\.\d+$/.test(context.left as string)) {
        (context as any).setResult(undefined).exit();
      } else {
        (context as any).setResult([context.left, context.right]).exit();
      }
    } else if (type === 'integer') {
      if (/^-?\d+$/.test(context.left as string)) {
        (context as any).setResult(undefined).exit();
      } else {
        (context as any).setResult([context.left, context.right]).exit();
      }
    } else if (type === 'array') {
      const leftArr = context.left as any[];
      const rightArr = leftArr.map(() => context.right.__item);
      (context as any).setResult(getDiffPatcher(refData).diff(leftArr, rightArr)).exit();
    } else if (type === 'ref') {
      const left = context.left;
      const right = jsonpath.value({
        self: (context as any).root.left,
        ...refData,
      }, context.right.__jsonPath);
      (context as any).setResult(getDiffPatcher(refData).diff(left, right)).exit();
    }
  }
};

export function getDiffPatcher(refData: any = {}) {
  const diffPatcher = new jsondiffpatch.DiffPatcher();

  const diffFilter = makeDiffFilter(refData);
  // a filterName is useful if I want to allow other filters to be inserted before/after this one
  (diffFilter as any).filterName = 'json-semantic-filter';

  (diffPatcher as any).processor.pipes.diff.before('trivial', diffFilter);
  return diffPatcher;
}

export function verify(jsonData: any, schema: ObjectSchema, refData: any={}): Delta | undefined {
  return getDiffPatcher(refData).diff(jsonData, schema);
}

export function htmlFormat(delta: Delta, schema: any): string {
  return htmlFormatter.format(delta, schema);
}
