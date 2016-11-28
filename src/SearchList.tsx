import React from 'react';
import { Pin } from "Pin";
import { AddressInput } from "AddressInput";

interface Props {
    autosuggestMgr : Microsoft.Maps.AutosuggestManager
}

interface State {
    inputsQty : number,
    pins : Pin[]
}

export class SearchList extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.handlePinUpdate = this.handlePinUpdate.bind(this);
        this.handlePinAdd = this.handlePinAdd.bind(this);
        this.handleAddInput = this.handleAddInput.bind(this);
        this.handleDeleteInput = this.handleDeleteInput.bind(this);
        this.addressInput = this.addressInput.bind(this);
    }

    componentWillMount() {
        this.setState({
            inputsQty: 1,
            pins: [],
        });
    }

    handleAddInput() {
        this.setState((prevState : State, props : Props) => {
            return {
                inputsQty: prevState.inputsQty + 1,
                pins: prevState.pins,
            }
        });
    }

    handlePinAdd(pin: Pin) {
        this.setState((prevState: State, props: Props) => {
            return {
                pins: [...prevState.pins, pin],
                inputsQty: prevState.inputsQty,
            };
        });
    }

    handlePinUpdate(addressInputId: number, pin: Pin) {
        this.setState((prevState: State, props: Props) => {
            const newPins = prevState.pins.slice();
            newPins[addressInputId] = pin;
            return {
                pins: newPins,
                inputsQty: prevState.inputsQty,
            };
        });
    }

    handleDeleteInput(addressInputId: number) {
        this.setState((prevState: State, props: Props) => {
            if (addressInputId < prevState.pins.length) {
                // gotta delete a pin
                return {
                    pins: prevState.pins.splice(addressInputId, 1),
                    inputsQty: prevState.inputsQty - 1,
                };
            }
            else {
                // deleting an empty field
                return {
                    pins: prevState.pins,
                    inputsQty: prevState.inputsQty - 1,
                };
            }
        })
    }

    addressInput(i: number) {
        if (i < this.state.pins.length) {
            return <AddressInput id={i}
                                 onUpdatedPin={this.handlePinUpdate}
                                 onDeleteAddressInput={this.handleDeleteInput}
                                 pin={this.state.pins[i]}
                                 autosuggestMgr={this.props.autosuggestMgr}
                                 key={i}/>
        }
        else {
            return <AddressInput id={i}
                                 onNewPin={this.handlePinAdd}
                                 onDeleteAddressInput={this.handleDeleteInput}
                                 autosuggestMgr={this.props.autosuggestMgr}
                                 key={i}/>
        }
    }

    addressInputElements() {
        // FIXME: would love to write this declaratively, akin to:
        //  (new Array(inputsQty)).map((i) => ...)
        // but have not been able to make that work in JS.
        let list = [];
        for (let i=0; i < this.state.inputsQty; i++) {
            list.push(this.addressInput(i));
        }
        return list;
    }

    render() {
        return <div>
            <h2>What are your favorite places?</h2>
            {this.addressInputElements()}
            <input type="button" value="+" onClick={this.handleAddInput}/>
        </div>;
    }
}
