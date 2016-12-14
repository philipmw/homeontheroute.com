import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'App';
import Pin from 'Pin';
import { BING_MAPS_KEY } from 'Credentials';

const MAP_CENTER = new Microsoft.Maps.Location(47.611427, -122.337454);

export interface State {
    map : Microsoft.Maps.Map,
    autosuggestMgr : Microsoft.Maps.AutosuggestManager,
    userLocLayer : Microsoft.Maps.Layer,
    busStopsLayer : Microsoft.Maps.ClusterLayer,
}

const INITIAL_STATE : State = {
    map: null,
    autosuggestMgr: null,
    userLocLayer: null,
    busStopsLayer: null,
};

interface Props {
    map : Microsoft.Maps.Map,
    userLocLayer : Microsoft.Maps.Layer,
    userLocations : Pin[],
    onMapInit : ((map : Microsoft.Maps.Map,
                  autosuggestMgr : Microsoft.Maps.AutosuggestManager,
                  userLocLayer : Microsoft.Maps.Layer,
                  busStopsLayer : Microsoft.Maps.ClusterLayer) => any),
}

function receivedBusStopsFor(layer : Microsoft.Maps.ClusterLayer) {
    return function() {
        const stops = JSON.parse(this.responseText);
        console.log(`Received ${stops.length} stops.`);
        layer.clear();
        layer.setPushpins(stops.map((stop) => {
            const loc = new Microsoft.Maps.Location(stop.lat, stop.lon);
            return new Microsoft.Maps.Pushpin(loc, {title: stop.name});
        }));
    }
}
function loadBusStopsIntoLayer(layer : Microsoft.Maps.ClusterLayer) {
    console.log("Loading stops...");
    const req = new XMLHttpRequest();
    req.addEventListener('load', receivedBusStopsFor(layer));
    req.open('GET', 'http://api.homeontheroute.com/stops');
    req.send();
}

class MapLazyAttrs {
    autosuggestMgr : Microsoft.Maps.AutosuggestManager;
    busStopsLayer : Microsoft.Maps.ClusterLayer;

    constructor(autosuggestMgr, busStopsLayer) {
        this.autosuggestMgr = autosuggestMgr;
        this.busStopsLayer = busStopsLayer;
    }
}

class MapComponent extends React.Component<Props, {}> {
    componentDidMount() {
        console.log("creating Map...");
        const map = new Microsoft.Maps.Map("#main-map", {
            credentials: BING_MAPS_KEY,
            center: MAP_CENTER,
            maxBounds: new Microsoft.Maps.LocationRect(
                MAP_CENTER,
                0.5, //width
                0.5 // height
            )
        });

        const userLocLayer = new Microsoft.Maps.Layer('user-locations');
        map.layers.insert(userLocLayer);

        Promise.all([
            new Promise((res) => {
                Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', () => {
                    console.log("Autosuggest loaded");
                    res(new Microsoft.Maps.AutosuggestManager());
                });
            }),
            new Promise((res) => {
                Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", () => {
                    console.log("Clustering loaded");
                    const busStopsLayer = new Microsoft.Maps.ClusterLayer([]);
                    map.layers.insert(busStopsLayer);
                    res(busStopsLayer);
                });
            }),
        ])
            .then((vals) => (new MapLazyAttrs(vals[0], vals[1])))
            .then((attrs) => {
                this.props.onMapInit(
                    map,
                    attrs.autosuggestMgr,
                    userLocLayer,
                    attrs.busStopsLayer);
                loadBusStopsIntoLayer(attrs.busStopsLayer);
            });
    }

    render() {
        console.log(`Map sees ${this.props.userLocations.length} user locations`);
        // Sync pins on the map with user locations.
        if (this.props.userLocLayer) {
            this.props.userLocLayer.clear();
            for (var pin of this.props.userLocations) {
                this.props.userLocLayer.add(
                    new Microsoft.Maps.Pushpin(
                        pin.location,
                        {
                            title: pin.text,
                        }
                    ));
            }
        }
        return <div id="main-map"></div>;
    }
}

export function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'MAP_INITIALIZED':
            return Object.assign({}, state, {
                map: action.map,
                autosuggestMgr: action.autosuggestMgr,
                userLocLayer: action.userLocLayer,
                busStopsLayer:action.busStopsLayer,
            });
        default:
            return state;
    }
}

const mapStateToProps = (state : AppState, ownProps : Props) => {
    return {
        map: state.map.map,
        userLocLayer: state.map.userLocLayer,
        userLocations: state.searchList.userLocations,
        busStopsLayer: state.map.busStopsLayer,
    }
};

const mapDispatchToProps = (dispatch) => (
    {
        onMapInit: (map, autosuggestMgr, userLocLayer, busStopsLayer) => dispatch({
            type: 'MAP_INITIALIZED',
            map,
            autosuggestMgr,
            userLocLayer,
            busStopsLayer,
        })
    }
);

export const Map = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
