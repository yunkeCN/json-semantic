import * as jsondiffpatch from "jsondiffpatch";
import { Delta, DiffContext } from "jsondiffpatch";
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

export function convertToMockJsTemplate(
  schema: ObjectSchema | number | boolean | string | undefined | any[],
  path = '',
): {
  template: any,
  rule?: string,
} {
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
    const isArr = Object.prototype.toString.call(schema1) === '[object Array]';
    if (isArr) {
      const clone: any[] = (schema as any[]).map((schemaValue, index) => {
        const {
          template,
        } = convertToMockJsTemplate(schemaValue as ObjectSchema, `${path}.${index}`);
        return template;
      });
      return { template: clone };
    } else {
      const clone: any = {};
      Object.keys(schema1).forEach((key) => {
        const schemaValue = schema1[key];
        const {
          template,
        } = convertToMockJsTemplate(schemaValue as ObjectSchema, `${path}.${key}`);
        clone[key] = template;
      });
      return { template: clone };
    }
  }

  const { __format: format, __max: max, __min: min, __ratio: ratio, __item: item } = schema1;

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
      } = convertToMockJsTemplate(item, `${path}.[]`);
      return {
        template: [template],
        rule: `${typeof min === 'undefined' ? '' : min}-${typeof max === 'undefined' ? '' : max}`,
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
      (context as any).setResult(getDiffPatcher().diff(leftArr, rightArr)).exit();
    }
  }
};
// a filterName is useful if I want to allow other filters to be inserted before/after this one
(diffFilter as any).filterName = 'json-semantic-filter';

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
