import React from 'react';
import { styled, keyframes } from '@stitches/react';

const Animation1 = keyframes({
    '0%': {
        transform: "rotate(0)"
    },
    '100%': {
        transform: "rotate(360deg)"
    }
});

const Animation2 = keyframes({
    '0%': {
        transform: "rotate(0)"
    },
    '100%': {
        transform: "rotate(360deg)"
    }
});

const Animation3 = keyframes({
    '0%': {
        transform: "rotate(0)"
    },
    '100%': {
        transform: "rotate(360deg)"
    }
});

const StyledSpinner = styled('div', {
    width: "var(--size)",
    height: "var(--size)",
    animation: `${Animation1} 3s linear infinite`
});

const StyledSpinner2 = styled('span', {
    top: 0,
    left: 0,
    clip: "rect(calc(var(--size) / 2), var(--size), var(--size), 0)",
    right: 0,
    width: "var(--size)",
    bottom: 0,
    margin: "auto",
    height: "var(--size)",
    position: "absolute",
    animation: `${Animation2} 1.5s cubic-bezier(0.770, 0.000, 0.175, 1.000) infinite`,

    "&:before": {
        top: 0,
        left: 0,
        right: 0,
        width: "inherit",
        bottom: 0,
        margin: "auto",
        height: "inherit",
        border: `calc(var(--size) / 10.66666666) solid transparent`,
        content: "",
        position: "absolute",
        borderTop: `calc(var(--size) / 10.66666666) solid #fff`,
        animation: `${Animation3} 1.5s cubic-bezier(0.770, 0.000, 0.175, 1.000) infinite`,
        borderRadius: "50%"
    },

    "&:after": {
        top: 0,
        left: 0,
        right: 0,
        width: "var(--size)",
        bottom: 0,
        height: "var(--size)",
        margin: "auto",
        border: `calc(var(--size) / 10.66666666) solid rgba(255, 255, 255, .5)`,
        content: "",
        position: "absolute",
        borderRadius: "50%"
    }
});

export default class Spinner extends React.Component {
    render() {
        const { margin, visible } = this.props;
        const size = this.props.size ?? 32;
        return (
            <StyledSpinner style={{
                "--size": `${size}px`,
                margin: margin ?? 0,
                display: `${(visible == null ? true : visible) ? "block" : "none"}`
            }}>
                <StyledSpinner2/>
            </StyledSpinner>
        );
    }
};