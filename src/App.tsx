import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import * as Redux from 'redux';
import thunk from 'redux-thunk'; // tslint:disable-line:import-name

import * as Dashboard from './Dashboard';
import * as Map from './Map';

export interface IAppState {
  map?: Map.IAppStateSlice;
  dashboard?: Dashboard.IAppStateSlice;
}

interface Window { // tslint:disable-line:interface-name
  hotrReduxStore: Redux.Store<IAppState>;
  hotrMapsLoaded: Function;
}
declare var window: Window;

class AppComponent extends React.Component<{}, IAppState> {
  public render(): JSX.Element {
    console.log('Rendering AppComponent');

    return <div>
      <Dashboard.Dashboard/>

      <Map.Map/>
    </div>;
  }
}

const store: Redux.Store<IAppState> = Redux.createStore<IAppState>(
  Redux.combineReducers<IAppState>({
    map: Map.reducer,
    dashboard: Dashboard.reducer,
  }),
  Redux.applyMiddleware(thunk)
);

window.hotrReduxStore = store;

// This global function exists only for debugging Bing Maps.  Its existence is
// not important to this app.
window.hotrMapsLoaded = (): void => {
  window.hotrReduxStore.dispatch(Map.loadMapComponentsAsyncAction);
};

ReactDOM.render(
  <Provider store={store}>
    <AppComponent/>
  </Provider>,
  document.getElementById('app-root')
);

store.dispatch({
  type: 'HOTR_APP_STARTED'
});

store.dispatch((dispatch: Redux.Dispatch<IAppState>): void => {
  Map.initializeAsync(dispatch);
});
