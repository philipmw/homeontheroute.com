import * as React from 'react';
import {connect} from 'react-redux';

import { IAppState } from './App';
import * as SearchList from './SearchList';

interface IProps {
  mapIsReady?: boolean;
}

export interface IAppStateSlice {
  searchList: SearchList.IAppStateSlice;
}

const INITIAL_STATE: IAppStateSlice = {
  searchList: SearchList.INITIAL_STATE
};

class DashboardComponent extends React.Component<IProps, IAppStateSlice> {
  public render(): JSX.Element {
    console.log('Rendering DashboardComponent');

    if (this.props.mapIsReady) {
      return <div>
        <div id='data-collection'>
          <h1>Home On The Route</h1>

          <SearchList.SearchList/>
        </div>
      </div>;
    } else {
      return <div>
        <div id='data-collection'>
          <h1>Home On The Route</h1>

          <p>Loading...</p>
        </div>
      </div>;
    }
  }
}

export function reducer(state: IAppStateSlice = INITIAL_STATE, action: any): IAppStateSlice {
  return Object.assign({}, state);
}

function mapStateToProps(state: IAppState): IProps {
  return {
    mapIsReady: state.map.autosuggestIsLoaded &&
                state.map.clusteringIsLoaded &&
                state.map.databinningIsLoaded
  };
}

// tslint:disable-next-line:variable-name
export const Dashboard: React.ComponentClass<IProps> = connect(mapStateToProps)(DashboardComponent);
