import React from 'react';
import ReactDOM from 'react-dom';

import { SearchList } from 'SearchList';
import { Map } from 'Map';

interface Props {
}

interface State {
  autosuggestMgr : Microsoft.Maps.AutosuggestManager
}

class App extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.setAutosuggestMgr = this.setAutosuggestMgr.bind(this);
    }

    componentWillMount() {
        this.setState({autosuggestMgr: null});
    }

    render() {
        console.log("rendering App");
        return <div>
            <div id="data-collection">
                <h1>Home On The Route</h1>

                <SearchList autosuggestMgr={this.state.autosuggestMgr}/>
            </div>

            <Map onAutosuggestLoad={this.setAutosuggestMgr}/>
        </div>
    }

    setAutosuggestMgr(autosuggestMgr : Microsoft.Maps.AutosuggestManager) {
        console.log("Autosuggest propagated to App!");
        this.setState({
            autosuggestMgr
        });
        console.log("Autosuggest saved to app state.");
    }
}
//
// namespace Map {
//     import Pushpin = Microsoft.Maps.Pushpin;
//     export function init() {
//         (<any>window).reduxStore.dispatch({
//             type: 'MAP_INITIALIZED',
//             map
//         });
//
//     }
//
//     export function appListener() {
//         console.log("Map is considering changing its entities");
//         let store : Redux.Store<AppState> = (<any>window).reduxStore;
//         let app : AppState = store.getState();
//
//         for (var i=0; i < QTY_LOCATION; ++i) {
//             let newLocation = app.locations[i];
//             if (newLocation) {
//                 (<any>document).getElementById(`locationInput${i}`).value = newLocation.formattedSuggestion;
//                 let pushpin = (app.map.entities.get(i)) as Microsoft.Maps.Pushpin;
//                 let pushpinOpts = {
//                     title: newLocation.formattedSuggestion
//                 };
//                 if (!pushpin) {
//                     console.log(`Adding element ${i}`);
//                     app.map.entities.insert(
//                         new Microsoft.Maps.Pushpin(
//                             newLocation.location,
//                             pushpinOpts
//                         ),
//                         i);
//                 }
//                 // FIXME: these locations always compare unequal.
//                 else if (pushpin.getLocation() != newLocation.location) {
//                     console.log(`Updating element ${i}`);
//                     pushpin.setLocation(newLocation.location);
//                     pushpin.setOptions(pushpinOpts);
//                     console.log("Updated.");
//                 }
//             }
//         }
//         // app.map.entities = app.locations.map(
//         //     (location: Microsoft.Maps.Location) => (new Microsoft.Maps.Pushpin(location))
//         // );
//     }
// }
//
// function appReducer(state = (new AppState()), action : any) {
//     let newState : AppState = (<any>Object).assign({}, state);
//     switch (action.type) {
//         case 'MAP_INITIALIZED':
//             newState.map = action.map;
//             console.log("Map initialized");
//             return newState;
//         case 'AUTOSUGGEST_MGR_INITIALIZED':
//             newState.autosuggestMgr = action.autosuggestMgr;
//             console.log("Autosuggest initialized");
//             return newState;
//         case 'SEARCH_MGR_INITIALIZED':
//             newState.searchMgr = action.searchMgr;
//             console.log("Search initialized");
//             return newState;
//         case 'LOCATION_CHANGED':
//             let locations = state.locations.slice();
//             locations[action.index] = action.location;
//             newState.locations = locations;
//             return newState;
//         default:
//             return state;

ReactDOM.render(
    React.createElement(App, {}),
    document.getElementById("app-root")
);
