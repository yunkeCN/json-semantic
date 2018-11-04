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

export interface ArraySchemaWithGenerics<T> {
  __type: 'array';
  __min: number;
  __max: number;
  __item: T;
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