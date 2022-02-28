import React from 'react';
import { styled } from '@stitches/react';

import Grid from './Grid';
import Typography from './Typography';

const StyledNavigation = styled(Grid, {
    top: 64,
    width: "100%",
    height: 48,
    zIndex: 1100,
    padding: "0 24px",
    position: "sticky",
    backgroundColor: "#181818"
});

export default class Navigation extends React.Component {
    render() {
        return (
            <StyledNavigation direction="horizontal" alignItems="center" justifyContent="space-between">
                <Grid spacing="24px" direction="horizontal" alignItems="center">
                    <Typography text={this.props.title} color="#cbcbcb"/>
                </Grid>
                <Grid spacing="24px" direction="horizontalReverse" alignItems="center">
                    {this.props.children}
                </Grid>
            </StyledNavigation>
        );
    }
};