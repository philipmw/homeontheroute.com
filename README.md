# Home On The Route

Home On The Route, a web app helping you find the perfect neighborhood for your car-free lifestyle.

## Development Requirements

First install these:

* [TypeScript](https://www.typescriptlang.org/) 2.0 (installed with Homebrew)
* [Typings](https://github.com/typings/typings) (installed with npm)

Then the typings for the following Javascript libraries:

* [Bing Maps V8 Web Control](https://msdn.microsoft.com/en-us/library/mt712542.aspx)

    ````
    typings install github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Microsoft.Maps.d.ts --global --save
    typings install github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Modules/Autosuggest.d.ts --global --save
    typings install github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Modules/Search.d.ts --global --save
    ````

* [Redux](https://github.com/reactjs/redux)

    ````
    typings install dt~redux
    ````


* [React](https://facebook.github.io/react)

    ````
    typings install react --save
    typings install react-dom --save
    ````

* [React-Redux](https://github.com/reactjs/react-redux)

    ````
    typings install react-redux --save
    ````

## Build

````
$ tsc
````

## Run

````
$ python -m SimpleHTTPServer 8000
````

Now go to http://localhost:8000

## Adding dependencies

````
typings search <dep>
typings install dt~<dependency> --save
````

This will auto-update `typings.json`.
