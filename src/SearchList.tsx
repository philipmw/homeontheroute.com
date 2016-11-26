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
        this.handleClick = this.handleClick.bind(this);
    }

    componentWillMount() {
        this.setState({
            inputsQty: 1,
            pins: [],
        });
    }

    handleClick() {
        console.log("+ was clicked");
        this.setState((prevState : State, props : Props) => ({
            inputsQty: prevState.inputsQty + 1,
            pins: prevState.pins,
        }));
    }

    handlePinAdd(pin: Pin) {
        console.log("SearchList.handlePinAdd");
        this.setState((prevState: State, props: Props) => {
            return {
                pins: [...prevState.pins, pin],
                inputsQty: prevState.inputsQty,
            };
        })
    }

    handlePinUpdate(addressInputId: number, pin: Pin) {
        console.log("SearchList.handlePinUpdate");
        this.setState((prevState: State, props: Props) => {
            const newPins = prevState.pins.slice();
            newPins[addressInputId] = pin;
            return {
                pins: newPins,
                inputsQty: prevState.inputsQty,
            };
        });
    }

    addressInputs() {
        var list = [];
        for (let i=0; i < this.state.pins.length; i++) {
            const pin = this.state.pins[i];
            list.push(
                <AddressInput id={i}
                              onUpdatedPin={this.handlePinUpdate}
                              pin={pin}
                              autosuggestMgr={this.props.autosuggestMgr}
                              key={pin.text}/>
            );
        }
        for (let i=0; i < (this.state.inputsQty - this.state.pins.length); i++) {
            const id = 999 + i;
            list.push(
                <AddressInput id={id}
                              onNewPin={this.handlePinAdd}
                              autosuggestMgr={this.props.autosuggestMgr}
                              key={id}/>

            );
        }

        return list;
    }

    render() {
        console.log("rendering SearchList");
        return <div>
            <h2>What are your favorite places?</h2>
            <table>
                <tbody>
                {this.addressInputs()}
                </tbody>
            </table>
            <input type="button" value="+" onClick={this.handleClick}/>
        </div>;
    }
}
