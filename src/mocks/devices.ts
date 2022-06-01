import cloneDeep from 'lodash/cloneDeep';
import { Devices } from 'src/app/utils';

const devicesMock: Devices = [
  {
    deviceName: 'My Laptop',
    sessions: [
      {
        lastModified: 1653365047,
        window: {
          alwaysOnTop: false,
          focused: false,
          height: 0,
          incognito: false,
          left: 0,
          tabs: [],
          top: 0,
          type: 'normal',
          width: 0,
        },
      },
      {
        lastModified: 1653365047,
        window: {
          alwaysOnTop: false,
          focused: false,
          height: 0,
          incognito: false,
          left: 0,
          tabs: [],
          top: 0,
          type: 'normal',
          width: 0,
        },
      },
    ],
  },
  {
    deviceName: 'My Phone',
    sessions: [
      {
        lastModified: 1653321338,
        window: {
          alwaysOnTop: false,
          focused: false,
          height: 0,
          incognito: false,
          left: 0,
          tabs: [],
          top: 0,
          type: 'normal',
          width: 0,
        },
      },
      {
        lastModified: 1653321338,
        window: {
          alwaysOnTop: false,
          focused: false,
          height: 0,
          incognito: false,
          left: 0,
          tabs: [],
          top: 0,
          type: 'normal',
          width: 0,
        },
      },
    ],
  },
];

export const getDevicesMock = () => cloneDeep(devicesMock);
