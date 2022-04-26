import React from 'react';

import DefaultApp from '/voxeliface/components/App/Tauri';

export default class App extends React.Component {
    render() {
        return (
            <DefaultApp
                title="mdpkm"
            {...this.props}/>
        );
    }
};