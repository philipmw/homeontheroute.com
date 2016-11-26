import React from 'react';
import { Pin } from "Pin";

interface Props {
    id: number,
    autosuggestMgr: Microsoft.Maps.AutosuggestManager,
    pin?: Pin,
    onUpdatedPin: (id: number, pin: Pin) => any,
    onNewPin: (pin: Pin) => any,
}

export class AddressInput extends React.Component<Props, {}>{
    textInput: HTMLInputElement;

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.userAcceptedAutosuggest = this.userAcceptedAutosuggest.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    handleChange() {
        console.log("handleChange()");
    }

    handleFocus(event) {
        console.log(`handleFocus; autosuggestMgr=${this.props.autosuggestMgr}`);
        const attachTo = `#addressinput-${this.props.id}-text`;
        this.props.autosuggestMgr.attachAutosuggest(
            attachTo,
            `#addressinput-${this.props.id}-container`,
            this.userAcceptedAutosuggest
        );
        console.log(`Attached autosuggest to ${attachTo}`);
    }

    handleBlur(event) {
        this.props.autosuggestMgr.detachAutosuggest();
        console.log("autosuggest is detached");
    }

    inputElementId() {
        return `addressinput-${this.props.id}-text`;
    }

    componentDidMount() {
        if (this.props.pin) {
            this.textInput.value = this.props.pin.text;
        }
    }

    userAcceptedAutosuggest(suggestionResult: Microsoft.Maps.ISuggestionResult) {
        console.log("User accepted autosuggest");
        const newPin : Pin = {
            location: suggestionResult.location,
            text: suggestionResult.formattedSuggestion.replace(/, Washington, United States$/, '')
        };
        this.textInput.value = newPin.text;

        if (this.props.pin) {
            console.log("AddressInput is emitting an updated pin");
            this.props.onUpdatedPin(this.props.id, newPin);
        }
        else {
            console.log("AddressInput is emitting a new pin");
            this.props.onNewPin(newPin);
        }
    }
    //
    // onChange(event) {
    //     this.setState({value: event.target.value});
    // }

    render() {
        console.log("rendering AddressInput");
        return <tr>
        <td>I work here:</td>
        <td>
        <div id={`addressinput-${this.props.id}-container`}>
            <input id={this.inputElementId()}
                   type="search"
                   width="50"
                   onFocus={this.handleFocus}
                   onBlur={this.handleBlur}
                   ref={(text) => this.textInput = text}
                   />
        </div>
        </td>
        </tr>;
    }
}

