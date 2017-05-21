# Home On The Route

Home On The Route, a web app helping you find the perfect neighborhood for your car-free lifestyle.

## Build status

* prod: [![CircleCI](https://circleci.com/gh/philipmw/homeontheroute.com/tree/master.svg?style=svg)](https://circleci.com/gh/philipmw/homeontheroute.com/tree/master)
* beta: [![CircleCI](https://circleci.com/gh/philipmw/homeontheroute.com/tree/beta.svg?style=svg)](https://circleci.com/gh/philipmw/homeontheroute.com/tree/beta)

## Development Requirements

For instructions on what it takes to set up Home On The Route on a fresh computer, refer to `.circleci/config.yml`.
This is guaranteed to be accurate, since this project is continuously built from it.

## Run locally

    $ npm run build   # for some reason `npm build` does nothing...
    $ npm start

Now go to http://localhost:8000

## Architecture

This web app uses _React_ for UX and _Redux_ for managing state.
The two are joined by _react-redux_.

I found these useful throughout development:

* http://redux.js.org/docs/basics/UsageWithReact.html
* http://redux.js.org/docs/advanced/AsyncActions.html
* https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options

The loading sequence:

1. `index.html` loads the DOM and app JS.  The app JS begins executing.
1. React loads the global Redux state, renders app components, and emits _HOTR_APP_STARTED_.
1. React asynchronously starts loading Bing Maps V8 Control.
1. Bing Maps V8 Control loads asynchronously, then invokes a callback.
1. The callback invokes an async Redux action that emits _MAPS_SDK_LOADED_,
   then loads all needed Maps SDK modules, then emits _MAPS_ALL_MODULES_LOADED_.
1. The end; now we react only to user input.

## Adding dependencies

### If in NPM

Update `package.json`, then:

    npm install

That'll allow compilation with TypeScript.

Update the HTML file to include the same JS from an external CDN.

### If in Typings

````
typings search <dep>
typings install dt~<dependency> --save
````

This will auto-update `typings.json`.

### Then

1. Update `index.html` to include the same JS from an external CDN.
2. Update `webpack.config.js` to know the new JS is provided externally.

Both of these steps are because I refuse to pay for hosting these dependencies myself; let the public CDN bear the cost.

## package.json

Since `package.json` does not support comments, this section is to document some things about it.

1. The `tsutils` dependency is a peer dependency of `tslint-microsoft-contrib@5.0.0`.