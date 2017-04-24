# Ionic Proximity Marketing App
## This repo is no longer maintained, check out the Ionic 2 version here: https://github.com/madewithpepper/Pulse-Proximity-App

![Pepper Beacons](visual.png)

**Provide iBeacon and Geofence services to your business and customers.**

This app uses the [Made with Pepper](https://madewithpepper.com) Proximity Marketing Platform API, https://madewithpepper.com/docs/v1/API/notification-boards.

## Prerequisites
The following libraries are required:

 - [NodeJS](https://www.nodejs.org)
 - [NPM](https://www.npmjs.com)
 - [Ionic and Cordova](http://ionicframework.com/docs/guide/installation.html)
 - [Bower](http://bower.io)
 - [Gulp](http://gulpjs.com)

## Installation
After you've downloaded the project, navigate to the root directory with your CLI.

### Install required NPM packages
`$ npm install`

### Install Bower JavaScript libraries
`$ bower install`

### Copy latest JavaScript libraries to project directory
In order to keep the app size small, we only copy the files required for app usage. See `gulpfile.js` for the associated task.

`$ gulp copy`

If you get a message like:
> `libsass` bindings not found. Try reinstalling `node-sass`?

try the following:

`$ npm update`

### Add Cordova plugins
`$ ionic state restore`

### Add platforms
Finally we can add the platform(s) as we're used with Ionic. For more information, visit http://ionicframework.com/docs/guide/installation.html.

For example:

`$ ionic platform add android`

`$ ionic run android`

## Configuration

### App name
Make sure you update the config.xml in the root with a name and version for your app. Also update the page title found in /www/index.html and the "app_title" variable found in the translation files (/www/i18n/*.json).

### App icon and splash screen
For more information on generating splash screen and icon images for all formats, visit http://ionicframework.com/docs/cli/icon-splashscreen.html.

### Logo
You can replace the Made with Pepper logo at /www/img/logos/app-logo-home.svg.

### Help content
Update the help view at /www/templates/help.html.

### Languages
Language files can be found at the /www/i18n/ directory. To add a new language:
- Copy a language file (e.g. en.json) and rename it to the language code you want to add a translation for (e.g. de.json).
- Open /www/templates/settings.html and add the language to the language select. E.g.: `<option value="de">Deutsch</option>`.

### Additional configuration
For additional configuration options see /www/js/config.js.