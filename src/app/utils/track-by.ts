import { BrowserTab, Device, Session, TabGroup, TopSite } from './models';

export const trackByDevice = (_, device: Device): string => device.deviceName;
export const trackByGroupId = (_, group: TabGroup): string => group.id;
export const trackBySession = (_, session: Session): string =>
  `${session.lastModified}+${session.tab?.id || session.window?.id}`;
export const trackBySite = (_, site: TopSite): string => `${site.title}+${site.url}`;
export const trackByTabId = (_, tab: BrowserTab): number => tab.id;
