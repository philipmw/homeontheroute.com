import * as React from 'react';
import {connect} from 'react-redux';
import * as Redux from 'redux';

import * as API from './API';
import {IAppState} from './App';
import Pin from './Pin';

export interface IAppStateSlice {
  map: Microsoft.Maps.Map;
  autosuggestMgr: Microsoft.Maps.AutosuggestManager;
  userLocLayer: Microsoft.Maps.Layer;
  busStopsLayer: Microsoft.Maps.ClusterLayer;
}

const INITIAL_STATE: IAppStateSlice = {
  map: null,
  autosuggestMgr: null,
  userLocLayer: null,
  busStopsLayer: null,
};

interface IProps {
  map?: Microsoft.Maps.Map;
  userLocLayer?: Microsoft.Maps.Layer;
  userLocations?: Pin[];
}

class MapComponent extends React.Component<IProps, {}> {
  public static defaultProps: IProps = {
    map: null,
    userLocLayer: null,
    userLocations: [],
  };

  public render() {
    console.log(`Map sees ${this.props.userLocations.length} user locations`);
    // Sync pins on the map with user locations.
    if (this.props.userLocLayer) {
      this.props.userLocLayer.clear();
      for (const pin of this.props.userLocations) {
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

export function initializeAsync(dispatch: Redux.Dispatch<IAppState>) {
  console.log('Beginning to initialize Map asynchronously from React');

  const MAP_CENTER = new Microsoft.Maps.Location(47.611427, -122.337454);

  let map: Microsoft.Maps.Map;
  let userLocLayer: Microsoft.Maps.Layer;
  let autosuggestMgr: Microsoft.Maps.AutosuggestManager;
  let busStopsLayer: Microsoft.Maps.ClusterLayer;

  Promise.resolve()
    .then(() => {
      console.log('Loading Bing Maps JS...');
      const bingScriptE = document.createElement('script');
      bingScriptE.setAttribute('src', '//www.bing.com/api/maps/mapcontrol');
      bingScriptE.setAttribute('type', 'text/javascript');
      document.body.appendChild(bingScriptE);
      console.log('Loading Bing Maps element created');
    })
    .then(() => {
      console.log('constructing Map...');
      map = new Microsoft.Maps.Map('#main-map', {
        // we can't hide this from the browser, so why hide it in source code?
        credentials: 'AmOCaZsYX3MP2cegEIheITvAYe2LF7vXLZKX9dHHMMIv4uH4JH2hWaZ6MEQ5C8k1',
        center: MAP_CENTER,
        maxBounds: new Microsoft.Maps.LocationRect(
          MAP_CENTER,
          0.5, //width
          0.5 // height
        )
      });
      console.log('Map constructed.');

      userLocLayer = new Microsoft.Maps.Layer('user-locations');
      map.layers.insert(userLocLayer);
    })
    .then(() =>
      Promise.all([
        new Promise((res) => {
          console.log('Loading AutoSuggest');
          Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', () => {
            console.log('Autosuggest loaded');
            res(new Microsoft.Maps.AutosuggestManager());
          });
        }),
        new Promise((res) => {
          console.log('Loading Clustering');
          Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', () => {
            console.log('Clustering loaded');
            busStopsLayer = new Microsoft.Maps.ClusterLayer([]);
            map.layers.insert(busStopsLayer);
            res(busStopsLayer);
          });
        }),
      ])
    )
    .then((vals) => {
      console.log('Map and modules are loaded!');
      autosuggestMgr = vals[0];
      busStopsLayer = vals[1];
    })
    .then(() => {
      console.log('Requesting bus stops from the API');
      return API.stops();
    })
    .then((stops) => {
      console.log(`Received ${stops.length} stops.  Loading them into the layer...`);
      busStopsLayer.clear();
      busStopsLayer.setPushpins(stops.map((stop) => {
        const loc = new Microsoft.Maps.Location(stop.lat, stop.lon);
        return new Microsoft.Maps.Pushpin(loc);
      }));
    })
    .then(() => {
      dispatch({
        type: 'MAP_INITIALIZED',
        map,
        autosuggestMgr,
        userLocLayer,
        busStopsLayer
      });
    });
}

export function reducer(state: IAppStateSlice = INITIAL_STATE, action: any) {
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

function mapStateToProps(state: IAppState) {
  return {
    map: state.map.map,
    userLocLayer: state.map.userLocLayer,
    userLocations: state.searchList.userLocations,
    busStopsLayer: state.map.busStopsLayer,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<{}>) {
  return {};
}

// tslint:disable-next-line:variable-name
export const Map = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
