import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk'; // tslint:disable-line:import-name

import * as Map from './Map';
import * as SearchList from './SearchList';

export interface IAppState {
  map?: Map.IAppStateSlice;
  searchList?: SearchList.IAppStateSlice;
}

interface Window { // tslint:disable-line:interface-name
  hotrReduxStore: Redux.Store<IAppState>;
}
declare var window: Window;

class AppComponent extends React.Component<IAppState, {}> {
  public render() {
    console.log('Rendering AppComponent');
    return <div>
      <div id='data-collection'>
        <h1>Home On The Route</h1>

        <SearchList.SearchList/>
      </div>

      <Map.Map/>
    </div>;
  }
}

const store = Redux.createStore<IAppState>(
  Redux.combineReducers<IAppState>({
    map: Map.reducer,
    searchList: SearchList.reducer,
  }),
  Redux.applyMiddleware(ReduxThunk)
);

window.hotrReduxStore = store;

ReactDOM.render(
  <Provider store={store}>
    <AppComponent/>
  </Provider>,
  document.getElementById('app-root')
);

store.dispatch({
  type: 'HOTR_APP_STARTED'
});
store.dispatch((dispatch) => {
  Map.initializeAsync(dispatch);
});
