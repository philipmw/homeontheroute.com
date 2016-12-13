import React from 'react';
import Pin from "Pin";

interface Props {
    id: number,
    autosuggestMgr: Microsoft.Maps.AutosuggestManager,
    pin?: Pin,
    onUpdatedPin: (id: number, pin: Pin) => any,
    onNewPin: (pin: Pin) => any,
    onDeleteAddressInput: (id: number) => any,
}

export class AddressInput extends React.Component<Props, {}>{
    textInput: HTMLInputElement;

    constructor(props) {
        super(props);
        this.userAcceptedAutosuggest = this.userAcceptedAutosuggest.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleDeleteButtonClicked = this.handleDeleteButtonClicked.bind(this);
    }

    handleFocus(event) {
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
        if (this.props.pin) {
            // If the user modified the text manually but did not accept
            // an autosuggest, clear away that pollution.
            this.textInput.value = this.props.pin.text;
        }
        console.log("autosuggest is detached");
    }

    inputElementId() {
        return `addressinput-${this.props.id}-text`;
    }

    componentDidMount() {
        if (this.props.pin) {
            this.textInput.value = this.props.pin.text;
        }
        else {
            // The browser will cache the input text for a given field ID
            // even if we renumber our addresses.  So this might be no longer
            // a pin, but it'll keep its stale text string.
            this.textInput.value = '';
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

    handleDeleteButtonClicked() {
        this.props.onDeleteAddressInput(this.props.id);
    }

    deleteButtonElement() {
        return <div className="delete-button">
            <input type="button"
                   value="-"
                   onClick={this.handleDeleteButtonClicked}
            />
        </div>;
    }
    render() {
        return <div id={`addressinput-${this.props.id}-container`}>
            <div className="addressinput">
                <input id={this.inputElementId()}
                       className={this.props.pin ? 'with-data' : 'no-data'}
                       type="search"
                       width="70"
                       onFocus={this.handleFocus}
                       onBlur={this.handleBlur}
                       ref={(text) => this.textInput = text}
                       />
            </div>
            {this.props.id > 0 ? this.deleteButtonElement() : ''}
        </div>;
    }
}

