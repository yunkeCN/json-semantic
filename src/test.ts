/**
 * @format
 */
import { generate, htmlFormat, stringify, verify } from './index';
import { ObjectSchema } from './types';

const testSchema: ObjectSchema = {
  float1: {
    __type: 'float',
  },
  float2: {
    __type: 'float',
  },
  float3: {
    __type: 'float',
  },
  float4: {
    __type: 'float',
  },
  number: 0,
  string: 'string',
  boolean: true,
  arrayEmpty: {
    __type: 'array',
    __max: Infinity,
    __min: 0,
    __item: {
      __type: 'integer',
    },
  },
  array: {
    __type: 'array',
    __max: Infinity,
    __min: 0,
    __item: {
      __type: 'integer',
    },
  },
  object: {
    a: 1,
    b: {
      __type: 'string',
      __format: /(a|c)/,
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
    __type: 'string',
    __format: '/.+\\.csv$/gi',
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
    __templateStr: '{{parse}}',
  },
  message: {
    __type: 'string',
    __format: 'xx',
  },
  'set-cookie': {
    __type: 'array',
    __min: 1,
    __max: 10,
    __item: {
      __type: 'string',
    },
  },
  message2: '@regexp:/^\\w+$/g',
  list: {
    __type: 'array',
    __min: 1,
    __max: 10,
    __item: {
      isBoolean: {
        __type: 'boolean',
      },
      isString: {
        __type: 'string',
      },
    },
  },
  body: {
    count: {
      __type: 'integer',
    },
    list: {
      __type: 'array',
      __min: 1,
      __max: 10,
      __item: {
        serialNo: {
          __type: 'string',
        },
        projectId: {
          __type: 'string',
        },
        loginAccount: {
          __type: 'string',
        },
        memorySize: {
          __type: 'integer',
        },
        availableMemorySize: {
          __type: 'integer',
        },
        totalStorageSize: {
          __type: 'integer',
        },
        availableStorageSize: {
          __type: 'integer',
        },
        cpuType: {
          __type: 'string',
        },
        isRoot: {
          __type: 'integer',
        },
        os: {
          __type: 'string',
        },
        osVersion: {
          __type: 'string',
        },
        appVersion: {
          __type: 'string',
        },
        phoneNumber: {
          __type: 'string',
        },
        location: {
          __type: 'string',
        },
        deviceTime: {
          __type: 'integer',
        },
        signalMode: {
          __type: 'integer',
        },
        networkMode: {
          __type: 'integer',
        },
        orgCode: {
          __type: 'string',
        },
        bindTime: {
          __type: 'integer',
        },
        isOnline: {
          __type: 'integer',
        },
        lastHeartbeat: {
          __type: 'integer',
        },
        carrierName: {
          __type: 'string',
        },
        phonePrefix: {
          __type: 'string',
        },
        appCpuProp: {
          __type: 'integer',
        },
        appMemoryUsed: {
          __type: 'integer',
        },
        appType: {
          __type: 'integer',
        },
        deviceModel: {
          __type: 'string',
        },
        signalModSelected: {
          __type: 'integer',
        },
        isOfflineNotice: {
          __type: 'boolean',
        },
      },
    },
  },
};

const schemaStr = stringify(testSchema);
const generateSchemaStr = generate(testSchema, { other: 1 });
// console.info('generate: ', generateSchemaStr);
// console.info('generate no mock: ', generate(testSchema, { other: 1 }, { genMock: false }));
// console.info('generate no mock with resolveRef: ', generate(testSchema, { other: 1 }, {
//   genMock: false,
//   resolveRef: (node: { args: any; jsonPath: string; schema: any; }) => {
//     if (node.schema.__jsonPath === '$.other1.add') {
//       return 'resolveByCustomer';
//     }
//     return jsonpath.value(node.args, node.jsonPath);
//   },
// }));
// console.info('parse: ', parse(schemaStr));

const jsonData = {
  float1: -1,
  float2: -1.1,
  float3: 1.1,
  float4: 1.0,
  number: 1,
  string: 'string1',
  boolean: false,
  arrayEmpty: [],
  array: [2, 2],
  object: { a: 2, b: 'b' },
  numberWithSchema: 4,
  floatWithSchema: 1.2,
  floatWithSchema1: 5.15245214119,
  stringWithSchema: '13529277784',
  stringWithSchema1: 'g.edshb@zjb.eh',
  stringWithSchema2: null,
  stringWithSchema3: '4S0.csv',
  arrayWithSchema: [{ a: '6832' }, { a: '56' }, { b: '7248' }, { a: '48' }],
  arrayWithSchema1: null,
  null: null,
  undefined: 'notUndefined',
  message: '登陆成功',
  'set-cookie': ['aaa', 'ddd', {}],
  message2: 'fbgG',
  list: [
    {
      isBoolean: false,
      isString: 'ssss',
    },
  ],
  body: {
    count: 9,
    list: [
      {
        appCpuProp: 0,
        appMemoryUsed: 72040448,
        appType: 1,
        appVersion: '2.4.3',
        availableMemorySize: 2008870912,
        availableStorageSize: 10959777792,
        bindTime: 1623723327,
        carrierName: '中国联通',
        cpuType: 'armeabi-v7a',
        deviceModel: 'Pro1t',
        deviceTime: 1624349648,
        isOfflineNotice: false,
        isOnline: 1,
        isRoot: 0,
        lastHeartbeat: 1624349649,
        location: '深圳',
        loginAccount: '17682323825',
        memorySize: 2008870912,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Android',
        osVersion: '5.1',
        phoneNumber: '+8618688956547',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1A32AK0N5101086',
        signalModSelected: 2,
        signalMode: 1,
        totalStorageSize: 13038026752,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 59117568,
        appType: 1,
        appVersion: '2.4.2',
        availableMemorySize: 2008870912,
        availableStorageSize: 10173825024,
        bindTime: 1622111326,
        carrierName: '中国联通',
        cpuType: 'armeabi-v7a',
        deviceModel: 'Pro1t',
        deviceTime: 1624349722,
        isOfflineNotice: true,
        isOnline: 1,
        isRoot: 0,
        lastHeartbeat: 1624349723,
        location: '深圳',
        loginAccount: '17682323825',
        memorySize: 2008870912,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Android',
        osVersion: '5.1',
        phoneNumber: '+8618688956575',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1A32AK0N5101005',
        signalModSelected: 2,
        signalMode: 1,
        totalStorageSize: 13146669056,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 35872768,
        appType: 1,
        appVersion: '2.4.3',
        availableMemorySize: 2008870912,
        availableStorageSize: 10155360256,
        bindTime: 1620804825,
        carrierName: '',
        cpuType: 'armeabi-v7a',
        deviceModel: 'Pro1t',
        deviceTime: 1624349760,
        isOfflineNotice: true,
        isOnline: 1,
        isRoot: 0,
        lastHeartbeat: 1624349761,
        location: '深圳',
        loginAccount: '17682323825',
        memorySize: 2008870912,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Android',
        osVersion: '5.1',
        phoneNumber: '+8618566271569',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1A32AK0M4001292',
        signalModSelected: 2,
        signalMode: 1,
        totalStorageSize: 13146669056,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 59891712,
        appType: 1,
        appVersion: '2.4.3',
        availableMemorySize: 951418880,
        availableStorageSize: 262885376,
        bindTime: 1616658979,
        carrierName: '',
        cpuType: 'armeabi-v7a',
        deviceModel: 'Pro1C',
        deviceTime: 1624349661,
        isOfflineNotice: false,
        isOnline: 1,
        isRoot: 0,
        lastHeartbeat: 1624349662,
        location: '0531',
        loginAccount: '17682323825',
        memorySize: 951418880,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Android',
        osVersion: '5.1',
        phoneNumber: '',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1C32AK0M3400913',
        signalModSelected: 2,
        signalMode: 2,
        totalStorageSize: 1560133632,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 55181312,
        appType: 1,
        appVersion: '2.2.4',
        availableMemorySize: 2008870912,
        availableStorageSize: 11954278400,
        bindTime: 1614068237,
        carrierName: '中国联通',
        cpuType: 'armeabi-v7a',
        deviceModel: 'Pro1t',
        deviceTime: 1614566804,
        isOfflineNotice: false,
        isOnline: 0,
        isRoot: 0,
        lastHeartbeat: 1615532158,
        location: '深圳',
        loginAccount: '17682323825',
        memorySize: 2008870912,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Android',
        osVersion: '5.1',
        phoneNumber: '+8618688956575',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1A32AK0N5101547',
        signalModSelected: 2,
        signalMode: 1,
        totalStorageSize: 13038026752,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 44703744,
        appType: 1,
        appVersion: '2.2.5',
        availableMemorySize: 951418880,
        availableStorageSize: 685244416,
        bindTime: 1612231434,
        carrierName: '',
        cpuType: 'armeabi-v7a',
        deviceModel: 'Pro1C',
        deviceTime: 1615859999,
        isOfflineNotice: false,
        isOnline: 0,
        isRoot: 0,
        lastHeartbeat: 1615532158,
        location: '0755',
        loginAccount: '',
        memorySize: 951418880,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Android',
        osVersion: '5.1',
        phoneNumber: '',
        phonePrefix: '3.',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1C32AK0M3400643',
        signalModSelected: 2,
        signalMode: 2,
        totalStorageSize: 1560133632,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 39366656,
        appType: 1,
        appVersion: '2.0.12',
        availableMemorySize: 951418880,
        availableStorageSize: 733257728,
        bindTime: 1610528202,
        carrierName: '',
        cpuType: 'armeabi-v7a',
        deviceModel: 'Pro1C',
        deviceTime: 1610678514,
        isOfflineNotice: false,
        isOnline: 0,
        isRoot: 0,
        lastHeartbeat: 1615532158,
        location: '0755',
        loginAccount: '',
        memorySize: 951418880,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Android',
        osVersion: '5.1',
        phoneNumber: '',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1C32AK0N5301484',
        signalModSelected: 2,
        signalMode: 0,
        totalStorageSize: 1560133632,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 0,
        appType: 0,
        appVersion: '1.0.0',
        availableMemorySize: 2008870912,
        availableStorageSize: 11,
        bindTime: 1606123537,
        carrierName: '',
        cpuType: '',
        deviceModel: '',
        deviceTime: -62135596800,
        isOfflineNotice: false,
        isOnline: 0,
        isRoot: 0,
        lastHeartbeat: 1615532158,
        location: '',
        loginAccount: '17682323825',
        memorySize: 2008870912,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Pro1t',
        osVersion: '5.1',
        phoneNumber: '',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1A32AH0B3600152',
        signalModSelected: 0,
        signalMode: 0,
        totalStorageSize: 12,
      },
      {
        appCpuProp: 0,
        appMemoryUsed: 0,
        appType: 0,
        appVersion: '1.0.0',
        availableMemorySize: 951398400,
        availableStorageSize: 4,
        bindTime: 1604048918,
        carrierName: '',
        cpuType: '',
        deviceModel: '',
        deviceTime: -62135596800,
        isOfflineNotice: false,
        isOnline: 0,
        isRoot: 0,
        lastHeartbeat: 1615532158,
        location: '',
        loginAccount: 'xingchang',
        memorySize: 951398400,
        networkMode: 1,
        orgCode: 'fangzhiadmin_test',
        os: 'Pro1C',
        osVersion: '5.1',
        phoneNumber: '',
        phonePrefix: '',
        projectId: '39f2960d-d8db-d408-d36f-01d08cb9cdbb',
        serialNo: 'P1C32AG0A2600189',
        signalModSelected: 0,
        signalMode: 0,
        totalStorageSize: 5,
      },
    ],
  },
};

const delta = verify(jsonData, testSchema, { other: 1 });
console.info('verify: ', delta);

if (delta) {
  const formatData = htmlFormat(delta, jsonData);

  if (formatData) {
    const deltaKeysIsRight = verify(
      {
        keys: Object.keys(delta),
      },
      {
        keys: [
          'number',
          'string',
          'boolean',
          'object',
          'stringWithSchema2',
          'arrayWithSchema1',
          'undefined',
          'message',
          'set-cookie',
          'refSchema',
          'refSchemaOther',
          'refEnv',
        ],
      },
    );
    if (!deltaKeysIsRight) {
      console.log(`\x1B[32m%s\x1B[39m`, '✨  test succeed');
    } else {
      console.log(`\x1b[31m%s\x1B[39m`, '✨  test failed');
    }
  }
}
