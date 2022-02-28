import React from 'react';
import { styled, keyframes } from '@stitches/react';

const SpinnerAnimation = keyframes({
    '0%': {
        transform: "rotate(0)"
    },
    '100%': {
        transform: "rotate(360deg)"
    }
});

const StyledSpinner = styled('div', {
    color: "#fff",
    borderRadius: "50%",
    borderTopColor: "transparent !important",
    
    animation: `${SpinnerAnimation} 1s linear infinite`
});

export default class Spinner extends React.Component {
    render() {
        const { size, margin, visible } = this.props;
        return (
            <StyledSpinner style={{
                width: `${size ?? 48}px`,
                margin: margin ?? 0,
                height: `${size ?? 48}px`,
                border: `calc(${size ?? 48}px / 9) solid`,
                display: `${(visible == null ? true : visible) ? "inline-block" : "none"}`
            }}/>
        );
    }
};