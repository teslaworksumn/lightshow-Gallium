# Gallium

Gallium is a GUI Application for running Tesla Works Light Show Events.

Directory structure:

```
app
├── config
├── css
├── html
├── js
└── img
```


* `app/` houses the app and all the files needed.
* `app/config` contains config files.
* `app/css` contains CSS files that are used in Gallium.
* `app/html` contains HTML files that are used in Gallium.
* `app/js` contains JavaScript files that are used in Gallium.
* `app/img` contains image files that are used in Gallium.

## Pre-requisites

1. [Node.js installed and in PATH.](https://nodejs.org/en/download/current/)

We are supporting Node.js version 10.11.0 with the plan to update to the LTS version when it comes out. Installing via your operating system's [package manager](https://nodejs.org/en/download/package-manager/) is an easy way to make sure it is set up correctly. Simply paste the command line options into the terminal and Node.js will be installed. Be sure to install Node.js version 10.x.

## Dev Environment Setup and Running

1. Run `npm install` from the root directory
2. Run `node setupRepo.js` from the root directory
3. Run `npm start`

NOTE: If you get an error that looks like `error while loading shared libraries: libgconf-2.so.4: cannot open shared object file: No such file or directory` while running `npm start`, you will have to install this shared library. This is fixed with `sudo apt-get install libgconf-2-4`.

## Application Packaging

1. Run `npm install` from the root directory
2. Run `node setupRepo.js` from the root directory
3. Run `npm run-script package`

NOTE: If you are on Mac or Linux you need Wine installed to package a Windows Build.

## Scripts

* `npm start` - Start an instance of the developer build.
* `npm run-script lint` - Lint our code
* `npm run-script lint-fix` - Fix common linting errors
* `npm run-script package` - Package app for Windows 64 bit, Mac OS, and Linux. 
* `npm run-script package-win32` - Package app for Windows 64 bit.
* `npm run-script package-darwin` - Package app for Mac OS.
* `npm run-script package-linux` - Package app for Linux.

## Styles

We are using a modified version of the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). One major change from the Airbnb guide is that we are using 4 space indents instead of 2. Run `npm run-script lint` to lint our code and `npm run-script lint-fix` to fix common errors. Some errors might need to be fixed manually.

## Authors

* [**Byron Ambright**](https://github.com/ByronAmbright)
* [**Joshua Guldberg**](https://github.com/theeldestelder)
* [**Julie Weber**](https://github.com/jewel2536)
* [**Alex Pelletier**](https://github.com/Naapple)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
