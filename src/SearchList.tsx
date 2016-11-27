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
        console.log(`Initialized state to inputsQty=1`);
    }

    handleAddInput() {
        this.setState((prevState : State, props : Props) => {
            console.log(`Ok, now there are ${prevState.inputsQty+1} inputs`);
            return {
                inputsQty: prevState.inputsQty + 1,
                pins: prevState.pins,
            }
        });
    }

    handlePinAdd(pin: Pin) {
        console.log("SearchList.handlePinAdd");
        this.setState((prevState: State, props: Props) => {
            console.log(`Ok, now there are ${prevState.inputsQty} inputs`);
            return {
                pins: [...prevState.pins, pin],
                inputsQty: prevState.inputsQty,
            };
        });
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

    handleDeleteInput(addressInputId: number) {
        this.setState((prevState: State, props: Props) => {
            return {
                pins: prevState.pins.splice(addressInputId, 1),
                inputsQty: prevState.inputsQty - 1,
            };
        })
    }

    addressInput(i: number) {
        console.log("Rendering addressInput...");
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

    render() {
        console.log("rendering SearchList");
        const rangeArray = Array(this.state.inputsQty, 0);
        console.log(`RangeArray: ${JSON.stringify(rangeArray)}`)
        const inputsList = rangeArray.map((i) => {
            console.log(i);
                        return <tr>
                            <td>{this.addressInput(i)}</td>
                        </tr>;
                    });
        console.log("created inputsList");
        const v = <div>
            <h2>What are your favorite places?</h2>
            <table>
                <tbody>
                    {inputsList}
                </tbody>
            </table>
            <input type="button" value="+" onClick={this.handleAddInput}/>
        </div>;
        console.log("rendered SearchList");
        return v;
    }
}
