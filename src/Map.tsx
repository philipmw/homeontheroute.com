import * as React from 'react';
import {connect} from 'react-redux';
import * as Redux from 'redux';

import * as API from './API';
import {IAppState} from './App';
import Pin from './Pin';

type AutosuggestMgr = Microsoft.Maps.AutosuggestManager;
type Layer = Microsoft.Maps.Layer;
type ClusterLayer = Microsoft.Maps.ClusterLayer;
type MsMap = Microsoft.Maps.Map;

export interface IAppStateSlice {
  map: MsMap;
  autosuggestMgr: AutosuggestMgr;
  userLocLayer: Layer;
  busStopsLayer: ClusterLayer;
}

const INITIAL_STATE: IAppStateSlice = {
  map: null,
  autosuggestMgr: null,
  userLocLayer: null,
  busStopsLayer: null,
};

interface IProps {
  map?: MsMap;
  userLocLayer?: Layer;
  userLocations?: Pin[];
}

class MapComponent extends React.Component<IProps, {}> {
  public static defaultProps: IProps = {
    map: null,
    userLocLayer: null,
    userLocations: [],
  };

  public render(): JSX.Element {
    console.log(`Map sees ${this.props.userLocations.length} user locations`);
    // Sync pins on the map with user locations.
    if (this.props.userLocLayer) {
      this.props.userLocLayer.clear();
      for (let pin of this.props.userLocations) { // tslint:disable-line:prefer-const
        this.props.userLocLayer.add(
          new Microsoft.Maps.Pushpin(
            pin.location,
            {
              title: pin.text,
            }
          ));
      }
    }

    return <div id='main-map'></div>;
  }
}

export function initializeAsync(dispatch: Redux.Dispatch<IAppState>): void {
  console.log('Beginning to initialize Map asynchronously from React');

  // We want to load Bing Maps, but the Bing Maps V8 Control always
  // loads asynchronously (because of sub-files, I guess), even
  // when we force the top-level JS file to load synchronously.
  //
  // So, we have to sleep, checking for window.Microsoft to start existing.
  //
  // Why not just use the callback functionality that Bing Maps supports?
  // I'd love to, for cleaner code, but I don't see a good way of sharing
  // `dispatch` with that callback.  We have it here, but if we have to
  // specify the callback by name in the dynamic <script> tag, we can't
  // keep our closure.  (I could hang `dispatch` on window, but come on,
  // that's gross design.)
  console.log('Loading Bing Maps JS...');
  const bingScriptE: HTMLElement = document.createElement('script');
  bingScriptE.setAttribute('src', '//www.bing.com/api/maps/mapcontrol?callback=hotrMapsLoaded');
  bingScriptE.setAttribute('type', 'text/javascript');
  bingScriptE.setAttribute('async', 'false');
  document.head.appendChild(bingScriptE);
  console.log('Created Bing Maps JS element');

  waitForMapScriptLoad(dispatch);
}

function isMapsJsLoaded(): boolean {
  // Microsoft Maps JS is loading asynchronously.  We need to wait until it is
  // fully loaded.  It's loading in parts, so we need to check for all the types
  // we're using -- otherwise it's a race condition.

  // http://stackoverflow.com/questions/138669/how-can-i-determine-if-a-javascript-variable-is-defined-in-a-page
  const NEEDED_TYPES: (() => string)[] = [
    (): string => typeof Microsoft,
    (): string => typeof Microsoft.Maps,
    (): string => typeof Microsoft.Maps.Location,
    (): string => typeof Microsoft.Maps.Map
  ];

  return NEEDED_TYPES.every((tf: (() => string)) => tf() !== 'undefined');
}

function waitForMapScriptLoad(dispatch: Redux.Dispatch<IAppState>): any {
  if (!isMapsJsLoaded()) {
    return setTimeout(() => waitForMapScriptLoad(dispatch), 10);
  } else {
    console.log('Bing Maps JS is loaded!  Proceeding with map initialization.');

    return initializeAfterScriptLoaded(dispatch);
  }
}

async function loadMap(): Promise<MsMap> {
  const MAP_CENTER: Microsoft.Maps.Location = new Microsoft.Maps.Location(47.611427, -122.337454);
  const MAP_BOUNDS: Microsoft.Maps.LocationRect = new Microsoft.Maps.LocationRect(
    MAP_CENTER,
    0.5, //width
    0.5 // height
  );
  console.log('constructing Map...');
  const map: MsMap = new Microsoft.Maps.Map('#main-map', {
    // we can't hide this from the browser, so why hide it in source code?
    credentials: 'AmOCaZsYX3MP2cegEIheITvAYe2LF7vXLZKX9dHHMMIv4uH4JH2hWaZ6MEQ5C8k1',
    center: MAP_CENTER,
    maxBounds: MAP_BOUNDS,
  });
  console.log('Map constructed.');

  return map;
}

function createUserLocationsLayer(map: MsMap): Microsoft.Maps.Layer {
  const userLocLayer: Layer = new Microsoft.Maps.Layer('user-locations');
  map.layers.insert(userLocLayer);

  return userLocLayer;
}

async function loadMapModules(map: MsMap): Promise<any> {
  return Promise.all([
    new Promise((res: Function): void => {
      console.log('Loading AutoSuggest');
      Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', () => {
        console.log('Autosuggest loaded');
        res(new Microsoft.Maps.AutosuggestManager());
      });
    }),
    new Promise((res: Function): void => {
      console.log('Loading Clustering');
      Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', () => {
        console.log('Clustering loaded');
        const busStopsLayer: ClusterLayer = new Microsoft.Maps.ClusterLayer([]);
        map.layers.insert(busStopsLayer);
        res(busStopsLayer);
      });
    }),
  ]);
}

async function loadStopsIntoMap(dispatch: Redux.Dispatch<IAppState>, busStopsLayer: ClusterLayer): Promise<void> {
  try {
    console.log('Requesting bus stops from the API');
    const stops: API.Stop[] = await API.stops();
    console.log(`Received ${stops.length} stops.  Loading them into the layer...`);
    busStopsLayer.clear();
    busStopsLayer.setPushpins(
      stops.map(
        (stop: API.Stop): Microsoft.Maps.Pushpin => new Microsoft.Maps.Pushpin(
          new Microsoft.Maps.Location(stop.lat, stop.lon),
          {
            icon: 'bus_stop_placard.png'
          })
      ));

    dispatch({
      type: 'STOPS_LOADED'
    });
  } catch (e) {
    console.error(`Could not load stops: ${e}`);
    throw e;
  }
}

async function initializeAfterScriptLoaded(dispatch: Redux.Dispatch<IAppState>): Promise<any> {
  try {
    const map: MsMap = await loadMap();
    const userLocLayer: Layer = createUserLocationsLayer(map);

    const modules: any[] = await loadMapModules(map);
    console.log('Modules are loaded!');
    const autosuggestMgr: AutosuggestMgr = (modules[0] as AutosuggestMgr);
    const busStopsLayer: ClusterLayer = (modules[1] as ClusterLayer);

    dispatch({
      type: 'MAP_INITIALIZED',
      map,
      autosuggestMgr,
      userLocLayer,
      busStopsLayer
    });

    await loadStopsIntoMap(dispatch, busStopsLayer);
  } catch (e) {
    console.log(`Map could not initialize: ${e}`);
    dispatch({
      type: 'MAP_INITIALIZE_ERROR',
      error: e
    });
    throw e;
  }
}

export function reducer(state: IAppStateSlice = INITIAL_STATE, action: any): IAppStateSlice {
  console.log(`Map reducer receives ${action.type}`);
  switch (action.type) {
    case 'MAP_INITIALIZED':
      return Object.assign({}, state, {
        map: action.map,
        autosuggestMgr: action.autosuggestMgr,
        userLocLayer: action.userLocLayer,
        busStopsLayer: action.busStopsLayer,
      });
    default:
      return state;
  }
}

function mapStateToProps(state: IAppState): IProps {
  return {
    map: state.map.map,
    userLocLayer: state.map.userLocLayer,
    userLocations: state.searchList.userLocations,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<{}>): IProps {
  return {};
}

// tslint:disable-next-line:variable-name
export const Map: React.ComponentClass<IProps> = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
