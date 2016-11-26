import React from 'react';
import { BING_MAPS_KEY } from 'Credentials';

interface Props {
    onAutosuggestLoad: (autosuggestMgr: Microsoft.Maps.AutosuggestManager)=>any
}

const MAP_CENTER = new Microsoft.Maps.Location(47.611427, -122.337454);

export class Map extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
        console.log("constructing Map");
    };

    render() {
        console.log("rendering #main-map");
        return <div id="main-map"></div>
    }

    componentDidMount() {
        console.log("creating Map...");
        const map = new Microsoft.Maps.Map("#main-map", {
            credentials: BING_MAPS_KEY,
            center: MAP_CENTER,
            maxBounds: new Microsoft.Maps.LocationRect(
                MAP_CENTER,
                0.5, //width
                0.5 // height
            )
        });
        Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', () => {
            console.log("Autosuggest loaded");
            const autosuggestMgr = new Microsoft.Maps.AutosuggestManager();
            this.setState({
                autosuggestMgr: autosuggestMgr
            });
            this.props.onAutosuggestLoad(autosuggestMgr);
        });
        console.log(`map = ${map}`);
        this.setState({ map });
    }
}