# eZPlug EV Charging Application
Electronic Vehicle charge application

## Install dependencies
Run `npm install` to install the project dependencies.

## Development Workflow
Run `ionic build` or `ionic build --prod` to build the project

### To test the app in the browser
Run `ionic serve` to start a live-reload dev server

### To livereload the application (runtime changes on real device)
Run `ng build` or `npm run build ` (for dev environment)
Run `ng build --prod` (for production environment)
Run `npx cap copy android/ios`
Run `npx cap sync android/ios`
Run `ionic capacitor run android  --livereload --address=ip_address` (mobile device and developement server should be connected in same network)

### To test the app as a Native App
This project uses [Capacitor](https://capacitor.ionicframework.com/docs/) (spiritual successor to Cordova).

Before starting make sure to read the [Capacitor Required Dependencies](https://capacitor.ionicframework.com/docs/getting-started/dependencies).

Run `ng build` or `npm run build ` (for dev environment)
Run `ng build --prod` (for production environment)
Run `npx cap copy android/ios`
Run `npx cap sync android/ios`
Run `ionic capacitor open android/ios`

The Capacitor workflow involves a few consistent tasks:
- [Develop and build your Web App](https://capacitor.ionicframework.com/docs/basics/workflow/#1-develop-and-build-your-web-app)
- [Copy your Web Assets](https://capacitor.ionicframework.com/docs/basics/workflow/#2-copy-your-web-assets)
- [Open your Native IDE](https://capacitor.ionicframework.com/docs/basics/workflow/#3-open-your-native-ide)
- [Periodic Maintenance](https://capacitor.ionicframework.com/docs/basics/workflow/#4-periodic-maintenance)

#### iOS Platform
This app has an ios folder which contains the iOS native app.
Read how to [build this app for iOS](https://capacitor.ionicframework.com/docs/basics/building-your-app#ios).

#### Android Platform
This app has an android folder which contains the Android native app.
Read how to [build this app for Android](https://capacitor.ionicframework.com/docs/basics/building-your-app#android).

## Support
Drop us a line to support@ezcharge.com


## Troubleshooting
### See what dependencies and versions you have installed in your project
This is useful to track compilation ERRORS

- Run `npm ls` to list all installed packages
- To find the installed version of a specific package run `npm list package_name` (ex: `npm list @ionic/core`)
- To find out which packages need to be updated, you can use `npm outdated -g --depth=0`
- In particular, run `ng version` to output Angular CLI version and all Angular related installed packages and versions
