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
    busStopsLayer : Microsoft.Maps.Layer,
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
                  busStopsLayer : Microsoft.Maps.Layer) => any),
}

function busStopsListener() {
    const stops = this.responseText;
    console.log(`Stops received: ${stops}`);
}

function loadBusStopsIntoLayer(layer : Microsoft.Maps.Layer) {
    console.log("Loading stops...");
    const req = new XMLHttpRequest();
    req.addEventListener('load', busStopsListener);
    req.open('GET', 'http://api.homeontheroute.com/stops');
    req.send();
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
        const busStopsLayer = new Microsoft.Maps.Layer('bus-stops');
        map.layers.insert(busStopsLayer);

        Promise.all([
            new Promise((res) => {
                Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', () => {
                    console.log("Autosuggest loaded");
                    res();
                });
            }),
            new Promise((res) => {
                Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", () => {
                    console.log("Clustering loaded");
                    res();
                });
            }),
        ])
            .then(() => {
                loadBusStopsIntoLayer(busStopsLayer);
            })
            .then(() => {
                this.props.onMapInit(
                    map,
                    new Microsoft.Maps.AutosuggestManager(),
                    userLocLayer,
                    busStopsLayer);
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
    }
};

const mapDispatchToProps = (dispatch) => (
    {
        onMapInit: (map, autosuggestMgr, userLocLayer) => dispatch({
            type: 'MAP_INITIALIZED',
            map,
            autosuggestMgr,
            userLocLayer,
        })
    }
);

export const Map = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
