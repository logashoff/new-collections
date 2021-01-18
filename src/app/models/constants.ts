import { MatFabMenu } from '@angular-material-extensions/fab-menu';

/**
 * URLs to ignore when saving tabs.
 */
export const ignoreUrlsRegExp = new RegExp('^(about:|chrome:|file:|wss:|ws:)');

export enum MenuIcons {
  Export = 'publish',
  Import = 'get_app',
  Save = 'save_alt',
}

export enum MenuAction {
  Export = 1,
  Import = 2,
  Save = 3,
}

export const menuItems: MatFabMenu[] = [
  {
    id: MenuAction.Save,
    icon: MenuIcons.Save,
  },
  {
    id: MenuAction.Export,
    icon: MenuIcons.Export,
  },
  {
    id: MenuAction.Import,
    icon: MenuIcons.Import,
  },
];
