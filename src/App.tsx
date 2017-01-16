import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Redux from 'redux';
import { connect, Provider } from 'react-redux';

import * as SearchList from './SearchList';
import * as Map from './Map';

export interface AppState {
    map?: Map.AppStateSlice,
    searchList?: SearchList.AppStateSlice,
}

interface Window {
    hotrReduxStore: Redux.Store<AppState>
}
declare var window: Window;

class AppComponent extends React.Component<AppState, {}> {
    render() {
        console.log("Rendering AppComponent");
        return <div>
            <div id="data-collection">
                <h1>Home On The Route</h1>

                <SearchList.SearchList/>
            </div>

            <Map.Map/>
        </div>;
    }
}

function mapStateToProps() {

}

function mapDispatchToProps() {

}

let store = Redux.createStore<AppState>(
    Redux.combineReducers<AppState>({
        map: Map.reducer,
        searchList: SearchList.reducer,
    })
);

window.hotrReduxStore = store;

ReactDOM.render(
    <Provider store={store}>
        <AppComponent/>
    </Provider>,
    document.getElementById("app-root")
);
