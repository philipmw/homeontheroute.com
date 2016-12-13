import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'App';
import Pin from 'Pin';
import { AddressInput } from "AddressInput";

interface Props {
    autosuggestMgr : Microsoft.Maps.AutosuggestManager,
    inputsQty : number,
    pins : Pin[],
    onAddInput : () => any,
    onAddPin : (pin : Pin) => any,
    onUpdatePin : (id : number, pin : Pin) => any,
    onDeleteInput : (id : number) => any,
}

class SearchListComponent extends React.Component<Props, {}> {
    addressInput(i: number) {
        if (i < this.props.pins.length) {
            return <AddressInput id={i}
                                 onUpdatedPin={this.props.onUpdatePin}
                                 onDeleteAddressInput={this.props.onDeleteInput}
                                 pin={this.props.pins[i]}
                                 autosuggestMgr={this.props.autosuggestMgr}
                                 key={i}/>
        }
        else {
            return <AddressInput id={i}
                                 onNewPin={this.props.onAddPin}
                                 onDeleteAddressInput={this.props.onDeleteInput}
                                 autosuggestMgr={this.props.autosuggestMgr}
                                 key={i}/>
        }
    }

    addressInputElements() {
        // FIXME: would love to write this declaratively, akin to:
        //  (new Array(inputsQty)).map((i) => ...)
        // but have not been able to make that work in JS.
        let list = [];
        for (let i=0; i < this.props.inputsQty; i++) {
            list.push(this.addressInput(i));
        }
        return list;
    }

    render() {
        const props = this.props;
        return <div>
            <h2>What are your favorite places?</h2>
            {this.addressInputElements()}
            <input type="button" value="+" onClick={() => props.onAddInput()}/>
        </div>;
    }
}

function mapStateToProps(state : AppState, ownProps : Props) {
    return {
        autosuggestMgr : state.map.autosuggestMgr,
        inputsQty : state.searchList.inputsQty,
        pins : state.searchList.userLocations,
    }
}

function mapDispatchToProps(dispatch, ownProps : Props) {
    return {
        onAddInput: () => {
            dispatch({
                type: 'ADD_INPUT',
            });
        },
        onAddPin: (pin : Pin) => {
            dispatch({
                type: 'ADD_PIN',
                pin,
            })
        },
        onUpdatePin: (id : number, pin : Pin) => {
            dispatch({
                type: 'UPDATE_PIN',
                id,
                pin,
            })
        },
        onDeleteInput: (id : number) => {
            dispatch({
                type: 'DELETE_INPUT',
                id,
            });
        }
    }
}

export function reducer(state = INITIAL_STATE, action) {
    console.log(`SearchList reducer receives ${action.type}`);
    switch (action.type) {
        case 'ADD_INPUT':
            return Object.assign({}, state, {
                inputsQty: state.inputsQty+1
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
            }
            else {
                // deleting an empty field
                return Object.assign({}, state, {
                    inputsQty: state.inputsQty - 1,
                });
            }
        default:
            return state;
    }
}

export interface State {
    inputsQty : number,
    userLocations : Pin[],
}

const INITIAL_STATE : State = {
    inputsQty: 1,
    userLocations: [],
};

export const SearchList = connect(mapStateToProps, mapDispatchToProps)(SearchListComponent);
