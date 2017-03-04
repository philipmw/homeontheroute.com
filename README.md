# Home On The Route

Home On The Route, a web app helping you find the perfect neighborhood for your car-free lifestyle.

## Build status

* prod: [![CircleCI](https://circleci.com/gh/philipmw/homeontheroute.com/tree/master.svg?style=svg)](https://circleci.com/gh/philipmw/homeontheroute.com/tree/master)
* beta: [![CircleCI](https://circleci.com/gh/philipmw/homeontheroute.com/tree/beta.svg?style=svg)](https://circleci.com/gh/philipmw/homeontheroute.com/tree/beta)

## Development Requirements

For instructions on what it takes to set up Home On The Route on a fresh computer, refer to `circle.yml`.
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
