# Home On The Route

Home On The Route, a web app helping you find the perfect neighborhood for your car-free lifestyle.

## Build status

* prod: [![CircleCI](https://circleci.com/gh/philipmw/homeontheroute.com/tree/master.svg?style=svg)](https://circleci.com/gh/philipmw/homeontheroute.com/tree/master)
* beta: [![CircleCI](https://circleci.com/gh/philipmw/homeontheroute.com/tree/beta.svg?style=svg)](https://circleci.com/gh/philipmw/homeontheroute.com/tree/beta)

## Development Requirements

For instructions on what it takes to set up Home On The Route on a fresh computer, refer to `circle.yml`.
This is guaranteed to be accurate, since this project is continuously built from it.

## Run locally

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
