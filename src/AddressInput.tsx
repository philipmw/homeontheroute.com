import * as React from 'react';

import Pin from './Pin';

interface IProps {
  id: number;
  autosuggestMgr: Microsoft.Maps.AutosuggestManager;
  pin?: Pin;
  onUpdatedPin(id: number, pin: Pin): any;
  onNewPin(pin: Pin): any;
  onDeleteAddressInput(id: number): any;
}

export class AddressInput extends React.Component<IProps, {}> {
  private textInput: HTMLInputElement;

  constructor(props: IProps) {
    super(props);
    this.userAcceptedAutosuggest = this.userAcceptedAutosuggest.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleRef = this.handleRef.bind(this);
    this.handleDeleteButtonClicked = this.handleDeleteButtonClicked.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.pin) {
      this.textInput.value = this.props.pin.text;
    } else {
      // The browser will cache the input text for a given field ID
      // even if we renumber our addresses.  So this might be no longer
      // a pin, but it'll keep its stale text string.
      this.textInput.value = '';
    }
  }

  public render(): JSX.Element {
    console.log('Rendering AddressInput');

    return <div id={`addressinput-${this.props.id}-container`}>
      <div className='addressinput'>
        <input id={this.inputElementId()}
               className={this.props.pin ? 'with-data' : 'no-data'}
               type='search'
               width='70'
               onFocus={this.handleFocus}
               onBlur={this.handleBlur}
               ref={this.handleRef}
        />
      </div>
      {this.props.id > 0 ? this.deleteButtonElement() : ''}
    </div>;
  }

  private handleFocus(): void {
    const attachTo: string = `#addressinput-${this.props.id}-text`;
    this.props.autosuggestMgr.attachAutosuggest(
      attachTo,
      `#addressinput-${this.props.id}-container`,
      this.userAcceptedAutosuggest
    );
    console.log(`Attached autosuggest to ${attachTo}`);
  }

  private handleBlur(): void {
    this.props.autosuggestMgr.detachAutosuggest();
    if (this.props.pin) {
      // If the user modified the text manually but did not accept
      // an autosuggest, clear away that pollution.
      this.textInput.value = this.props.pin.text;
    }
    console.log('autosuggest is detached');
  }

  private inputElementId(): string {
    return `addressinput-${this.props.id}-text`;
  }

  private userAcceptedAutosuggest(suggestionResult: Microsoft.Maps.ISuggestionResult): void {
    console.log('User accepted autosuggest');
    const newPin: Pin = {
      location: suggestionResult.location,
      text: suggestionResult.formattedSuggestion.replace(/, Washington, United States$/, '')
    };
    this.textInput.value = newPin.text;

    if (this.props.pin) {
      console.log('AddressInput is emitting an updated pin');
      this.props.onUpdatedPin(this.props.id, newPin);
    } else {
      console.log('AddressInput is emitting a new pin');
      this.props.onNewPin(newPin);
    }
  }

  private handleDeleteButtonClicked(): void {
    this.props.onDeleteAddressInput(this.props.id);
  }

  private deleteButtonElement(): JSX.Element {
    return <div className='delete-button'>
      <input type='button'
             value='-'
             onClick={this.handleDeleteButtonClicked}
      />
    </div>;
  }

  private handleRef(element: HTMLInputElement): void {
    this.textInput = element;
  }
}
