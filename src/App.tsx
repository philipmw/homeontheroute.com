import React from 'react';
import ReactDOM from 'react-dom';
import * as Redux from 'redux';
import { connect, Provider } from 'react-redux';

import * as SearchList from 'SearchList';
import * as Map from 'Map';

export interface AppState {
    map: Map.State,
    searchList: SearchList.State,
}

class AppComponent extends React.Component<AppState, {}> {
    render() {
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

ReactDOM.render(
    <Provider store={store}>
        <AppComponent/>
    </Provider>,
    document.getElementById("app-root")
);
