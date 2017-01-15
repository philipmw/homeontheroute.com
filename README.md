# Home On The Route

Home On The Route, a web app helping you find the perfect neighborhood for your car-free lifestyle.

## Development Requirements

First, install with Homebrew:

* [Npm](http://www.npmjs.com)

Then, install with Npm:

* [Webpack](http://webpack.github.io): `npm install --save-dev webpack@beta`
* [TypeScript](https://www.typescriptlang.org/): `npm install typescript`
* [Typings](https://github.com/typings/typings): `npm install typings`
* [ts-loader](https://github.com/TypeStrong/ts-loader): `npm install ts-loader`

Then the typings for the following Javascript libraries:

* [Bing Maps V8 Web Control](https://msdn.microsoft.com/en-us/library/mt712542.aspx)

    ````
    typings install github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Microsoft.Maps.d.ts --global --save
    typings install github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Modules/Autosuggest.d.ts --global --save
    typings install github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Modules/Clustering.d.ts --global --save
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
$ ./node_modules/.bin/webpack
````

## Run

````
$ python -m SimpleHTTPServer 8000
````

Now go to http://localhost:8000

## Architecture

This web app uses _React_ for UX and _Redux_ for managing state.
The two are joined by _react-redux_.

The loading sequence:

1. `index.html` loads the DOM, app JS, and begins loading Bing Maps V8 Control.
1. React loads the global Redux state and app components.  The app loads without a map for now.
1. Bing Maps V8 Control loads asynchronously and invokes the callback `BingMapControlLoaded()`.
1. `BingMapControlLoaded` updates the Redux state with the fact that Bing Maps JS is now available.
1. The app renders the map.

Note that there's a race condition:
if Bing Maps V8 Control loads before React sets up the global Redux state, the callback won't be able to signal that maps JS is ready.
The app will crash.
But I consider this rare enough that I don't want to spend time fixing it right now.

## Adding dependencies

````
typings search <dep>
typings install dt~<dependency> --save
````

This will auto-update `typings.json`.
