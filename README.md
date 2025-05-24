<p align="center">
  <a href="https://chrome.google.com/webstore/detail/save-tabs/lfchffgphpkiobhgmpbdminmdieacaje" target="_blank" rel="noopener">
    <img width="100" src="https://github.com/user-attachments/assets/7991a786-b5df-4d6b-8107-07b98dd64ba7" alt="New Collections logo">
  </a>
</p>

# New Collections

New Collections is a browser extension that allows to quickly save and restore open tabs without creating new bookmark entries. It doesn't use any online services or connections except Chrome's default storage sync service to optionally sync data between browsers. Import and export can be done by saving and loading generated JSON file.

Extension can be used as a popup or New Tab page. New Tab page can optionally display top sites and open tabs from synced devices.

### Features

- [x] Save and restore tabs
- [x] Import/export saved tabs using JSON file
- [x] Automatic theme adjustment based on browser colors
- [x] Remove individual tabs or entire tab group
- [x] Edit tab title and URL
- [x] Search saved tabs and open tabs from synced devices
- [x] New tabs can be added to existing tab groups
- [x] Display top sites on New Tab page
- [x] Display synced tabs from other devices on New Tab page

## Build

Run `yarn build` or `yarn build:dev` to build the project. The build artifacts will be stored in the `dist/` directory. Github build artifacts are also available under [Actions](https://github.com/logashoff/new-collections/actions) per each run.

## Running unit tests

Run `yarn test` or `yarn test:watch` to execute the unit tests.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Lint
Run `yarn lint` to check for lint errors. Run `yarn fmt` to quickly format pending code changes and fix lint errors.
