import { BrowserTab, HostnameGroup, TabGroup, TimelineElement, TopSite } from './models';

export const trackByGroupId = (_, group: TabGroup): string => group.id;
export const trackByIcons = (_, icons: HostnameGroup): number => icons.length;
export const trackBySite = (_, site: TopSite): string => `${site.title}+${site.url}`;
export const trackByTabId = (_, tab: BrowserTab): number => tab.id;
export const trackByLabel = (_, item: TimelineElement): string => item.label;
