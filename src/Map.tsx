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
  autosuggestIsLoaded: boolean;
  clusteringIsLoaded: boolean;
  databinningIsLoaded: boolean;
  autosuggestMgr: AutosuggestMgr;
  userLocLayer: Layer;
  busStopsLayer: ClusterLayer;
}

const INITIAL_STATE: IAppStateSlice = {
  map: null,
  autosuggestIsLoaded: false,
  clusteringIsLoaded: false,
  databinningIsLoaded: false,
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
  // The first draft of this code would start loading Bing Maps, then
  // sleep, checking for window.Microsoft (and sub-classes) to start
  // existing.  But there was a race condition, because even when all
  // classes I knew about were loaded, the Map SDK still wasn't always
  // ready -- it would occasionally throw the exception
  //   TypeError: n is null
  // Confirming the race condition, Bing Maps would invoke the completion
  // callback /after/ my logic decided that all Maps components exist.
  //
  // So, let's embrace the completion callback.  We'll wait until *Maps*
  // says it's done, then dispatch the MAPS_SDK_LOADED Redux action.
  // Because the completion callback isn't a container component, it does
  // not have access to `dispatch()`.  To accommodate that, the App created
  // `window.hotrReduxStore`.

  console.log('Loading Bing Maps JS...');
  const bingScriptE: HTMLElement = document.createElement('script');
  bingScriptE.setAttribute('src', '//www.bing.com/api/maps/mapcontrol?callback=hotrMapsLoaded');
  bingScriptE.setAttribute('type', 'text/javascript');
  bingScriptE.setAttribute('async', 'false');
  document.head.appendChild(bingScriptE);
  console.log('Created Bing Maps JS element');
}

function createUserLocationsLayer(map: MsMap): Microsoft.Maps.Layer {
  const userLocLayer: Layer = new Microsoft.Maps.Layer('user-locations');
  map.layers.insert(userLocLayer);

  return userLocLayer;
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

export function loadMapComponentsAsyncAction(
  dispatch: Redux.Dispatch<IAppState>,
  getState: () => IAppState): void {
  dispatch({
    type: 'MAPS_SDK_LOADED'
  });

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

  dispatch({
    type: 'MAP_INITIALIZED'
  });

  Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', () => {
    console.log('Autosuggest loaded');
    dispatch({
      type: 'MAPS_MODULE_AUTOSUGGEST_LOADED',
      autosuggestMgr: new Microsoft.Maps.AutosuggestManager()
    });

    checkForModulesCompletion(dispatch, getState);
  });

  Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', () => {
    console.log('Clustering loaded');
    dispatch({
      type: 'MAPS_MODULE_CLUSTERING_LOADED'
    });

    checkForModulesCompletion(dispatch, getState);
  });

  Microsoft.Maps.loadModule('Microsoft.Maps.DataBinning', () => {
    console.log('Data Binning loaded');
    dispatch({
      type: 'MAPS_MODULE_DATABINNING_LOADED'
    });

    checkForModulesCompletion(dispatch, getState);
  });
    // const busStopsLayer: ClusterLayer = new Microsoft.Maps.ClusterLayer([]);
    // map.layers.insert(busStopsLayer);
    // const userLocLayer: Layer = createUserLocationsLayer(map);
}

function checkForModulesCompletion(
  dispatch: Redux.Dispatch<IAppState>,
  getState: () => IAppState): void {
  const state: IAppState = getState();

  if (state.map.autosuggestIsLoaded &&
      state.map.clusteringIsLoaded &&
      state.map.databinningIsLoaded) {
    dispatch({
      type: 'MAPS_ALL_MODULES_LOADED'
    });
  }
}

export function reducer(state: IAppStateSlice = INITIAL_STATE, action: any): IAppStateSlice {
  console.log(`Map reducer receives ${action.type}`);
  switch (action.type) {
    case 'MAPS_MODULE_AUTOSUGGEST_LOADED':
      return Object.assign({}, state, {
        autosuggestIsLoaded: true,
        autosuggestMgr: action.autosuggestMgr
      });
    case 'MAPS_MODULE_CLUSTERING_LOADED':
      return Object.assign({}, state, {
        clusteringIsLoaded: true
      });
    case 'MAPS_MODULE_DATABINNING_LOADED':
      return Object.assign({}, state, {
        databinningIsLoaded: true
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
