import React from 'react';
import { styled } from '@stitches/react';

const StyledMain = styled('main', {
    display: "flex",
    flexGrow: 1,
    maxHeight: "calc(100vh - 64px)",
    background: "#1D1D1D",
    alignItems: "center",
    alignContent: "center",
    flexDirection: "column"
});

export default class Main extends React.Component {
    render() {
        return (
            <StyledMain style={{
                width: this.props.width,
                ...this.props.style
            }}>
                {this.props.children}
            </StyledMain>
        );
    }
};