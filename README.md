# Gallium

Gallium is a GUI Application for running Tesla Works Light Show Events.

Directory structure:

```
└── app
    ├── config
    ├── css
    ├── html
    ├── js
    └── img
└── test
```

* `app/` houses the app and all the files needed.
* `app/config` contains config files.
* `app/css` contains CSS files that are used in Gallium.
* `app/html` contains HTML files that are used in Gallium.
* `app/js` contains JavaScript files that are used in Gallium.
* `app/img` contains image files that are used in Gallium.
* `test/` contains the test suite for Gallium.

## Pre-requisites (all users)

1. [Node.js installed and in PATH.](https://nodejs.org/en/download/)

We are supporting Node.js version 10.16.3. Installing via your operating system's [package manager](https://nodejs.org/en/download/package-manager/) is an easy way to make sure it is set up correctly. Simply paste the command line options into the terminal and Node.js will be installed. Otherwise you can download the installer and set it up that way.

### Windows users

1. Run `npm install --global --production windows-build-tools` from an elevated Powershell or CMD.exe (run as Administrator). Note that this step will take a while so be sure to give it some time to finish. Even though the command will stop outputing information, it still is working. 

### Mac users

1. XCode command line tools must be installed for most commands to work. If you don't already have XCode installed, either install the latest version of XCode from the app store or run `xcode-select --install` if you only want to install the XCode command line tools. Note that this step may take a while so be sure to give it some time to finish. 

## Dev Environment Setup and Running

**Only run these steps after you have completed the [pre-requisite steps](#pre-requisites-all-users).**

1. Change directory to the repo root directory (`lightshow-Gallium/`)
1. Run `npm install` to install npm dependencies
1. Run `node setupRepo.js` to initialize certain directories and files

### Running the app
1. Run `npm start`

NOTE: If you get an error that looks like `error while loading shared libraries: libgconf-2.so.4: cannot open shared object file: No such file or directory` while running `npm start`, you will have to install this shared library. This is fixed with `sudo apt-get install libgconf-2-4`.

## Application Packaging

1. Change directory to the repo root directory (`lightshow-Gallium/`)
1. Run `npm install`
1. Run `node setupRepo.js`
1. Run `npm run-script package`

NOTE: If you are on Mac or Linux, you will need [Wine](https://www.winehq.org/) installed to package a Windows Build.

## Scripts

* `npm start` - Start an instance of the developer build
* `npm run-script lint` - Lint the code
* `npm run-script lint-fix` - Automatically fix common linting errors
* `npm run-script pack` - Generates the package directory without really packaging it
* `npm run-script build` - Package app in a distributable format for the current OS
* `npm run-script buildall` - Package app in a distributable format for Windows, MacOS, and Linux
* `npm run-script buildosx` - Package app in a distributable format for MacOS
* `npm run-script buildwin` - Package app in a distributable format for Windows
* `npm run-script buildlinux` - Package app in a distributable format for Linux
* `npm run-script test` - Run the test suite contained in `test/`

## Styles

We are using a modified version of the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). One major change from the Airbnb guide is that we are using 4 space indents instead of 2. Run `npm run-script lint` to lint our code and `npm run-script lint-fix` to fix common errors. Some errors might need to be fixed manually.

## Authors

* [**Byron Ambright**](https://github.com/ByronAmbright)
* [**Joshua Guldberg**](https://github.com/theeldestelder)
* [**Nick Schatz**](https://github.com/nickschatz)
* [**Julie Weber**](https://github.com/jewel2536)
* [**Kayla Engelstad**](https://github.com/kayla-e774)
* [**Alex Pelletier**](https://github.com/Naapple)
* [**Bengt Symstad**](https://github.com/bsymstad)
* [**David Ma**](https://github.com/DavidThe4sian)
* [**Alex Pelletier**](https://github.com/Naapple)
* [**Ashmita Sarma**](https://github.com/schmiter)
* [**Bengt Symstad**](https://github.com/bsymstad)
* [**Chris Walaszek**](https://github.com/walas013)
* [**Ryan Fredlund**](https://github.com/bookdude13)
* [**David Hwang**](https://github.com/hwangdav000)
* [**Zeb Zimmer**](https://github.com/ZebZim)
* [**Mitali Naigaonkar**](https://github.com/metallical)
* [**Zachary Guldberg**](https://github.com/Laserrpg999)
* [**Brooke Bear**](https://github.com/bear0224)
* [**Jack Struck**](https://github.com/Struc2025)
* [**Soumya Khandelwal**](https://github.com/soumyakhandelwalsk)
* [**Jasjit Kaur A Singh**](https://github.com/jks24)
* [**Jimena Jimenez**](https://github.com/jimenajmz)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
