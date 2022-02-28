import React from 'react';

import Grid from './Grid';

export default class App extends React.Component {
    render() {
        return (
            <Grid width="100vw" height="100vh" direction="vertical">
                {this.props.children}
            </Grid>
        );
    }
};