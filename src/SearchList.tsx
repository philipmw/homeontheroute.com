import * as React from 'react';
import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';

import {AddressInput} from './AddressInput';
import {IAppState} from './App';
import Pin from './Pin';

interface IProps {
  autosuggestMgr?: Microsoft.Maps.AutosuggestManager;
  inputsQty?: number;
  pins?: Pin[];
  onAddInput?: () => any;
  onAddPin?: (pin: Pin) => any;
  onUpdatePin?: (id: number, pin: Pin) => any;
  onDeleteInput?: (id: number) => any;
}

export interface IAppStateSlice {
  inputsQty: number;
  userLocations: Pin[];
}

const INITIAL_STATE: IAppStateSlice = {
  inputsQty: 1,
  userLocations: [],
};

class SearchListComponent extends React.Component<IProps, {}> {
  public static defaultProps: IProps = {
    autosuggestMgr: null,
    inputsQty: 0,
    pins: [],
  };

  private addressInput(i: number) {
    if (i < this.props.pins.length) {
      return <AddressInput id={i}
                           onNewPin={null}
                           onUpdatedPin={this.props.onUpdatePin}
                           onDeleteAddressInput={this.props.onDeleteInput}
                           pin={this.props.pins[i]}
                           autosuggestMgr={this.props.autosuggestMgr}
                           key={i}/>;
    } else {
      return <AddressInput id={i}
                           onNewPin={this.props.onAddPin}
                           onUpdatedPin={null}
                           onDeleteAddressInput={this.props.onDeleteInput}
                           autosuggestMgr={this.props.autosuggestMgr}
                           key={i}/>;
    }
  }

  private addressInputElements() {
    // I would love to write this declaratively, akin to:
    //  (new Array(inputsQty)).map((i) => ...)
    // but have not been able to make that work in JS.
    const list = [];
    for (let i = 0; i < this.props.inputsQty; i += 1) {
      list.push(this.addressInput(i));
    }
    return list;
  }

  public render() { // tslint:disable-line:no-unused-variable
    console.log('Rendering SearchList');
    const props = this.props;
    return <div>
      <h2>What are your favorite places?</h2>
      {this.addressInputElements()}
      <input type='button' value='+' onClick={props.onAddInput}/>
    </div>;
  }
}

function mapStateToProps(state: IAppState, ownProps: IProps) {
  return {
    autosuggestMgr: state.map.autosuggestMgr,
    inputsQty: state.searchList.inputsQty,
    pins: state.searchList.userLocations,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<{}>, ownProps: IProps) {
  return {
    onAddInput: () => {
      dispatch({
        type: 'ADD_ADDRESS_INPUT',
      });
    },
    onAddPin: (pin: Pin) => {
      dispatch({
        type: 'ADD_PIN',
        pin,
      });
    },
    onUpdatePin: (id: number, pin: Pin) => {
      dispatch({
        type: 'UPDATE_PIN',
        id,
        pin,
      });
    },
    onDeleteInput: (id: number) => {
      dispatch({
        type: 'DELETE_INPUT',
        id,
      });
    }
  };
}

export function reducer(state: IAppStateSlice = INITIAL_STATE, action: any) {
  console.log(`SearchList reducer receives ${action.type}`);
  switch (action.type) {
    case 'ADD_ADDRESS_INPUT':
      return Object.assign({}, state, {
        inputsQty: state.inputsQty + 1
      });
    case 'ADD_PIN':
      return Object.assign({}, state, {
        userLocations: [...state.userLocations, action.pin]
      });
    case 'UPDATE_PIN':
      const newPins = state.userLocations.slice();
      newPins[action.id] = action.pin;
      return Object.assign({}, state, {
        userLocations: [...state.userLocations, action.pin]
      });
    case 'DELETE_INPUT':
      if (action.id < state.userLocations.length) {
        // gotta delete a pin
        return Object.assign({}, state, {
          userLocations: state.userLocations.splice(action.id, 1),
          inputsQty: state.inputsQty - 1,
        });
      } else {
        // deleting an empty field
        return Object.assign({}, state, {
          inputsQty: state.inputsQty - 1,
        });
      }
    default:
      return state;
  }
}

// tslint:disable-next-line:variable-name
export const SearchList = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(SearchListComponent);
