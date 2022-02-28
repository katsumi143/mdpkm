import React from 'react';
import { styled } from '@stitches/react';

const StyledButton = styled('a', {
    gap: 8,
    width: "fit-content",
    border: "none",
    cursor: "pointer",
    height: "fit-content",
    outline: 0,
    display: "inline-flex",
    position: "relative",
    fontSize: ".75rem",
    transition: "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), border 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "Nunito, sans-serif",
    fontWeight: 625,
    lineHeight: 1.43,
    userSelect: "none",
    alignItems: "center",
    whiteSpace: "nowrap",
    textShadow: "0 0 4px rgba(0, 0, 0, 0.2)",
    borderRadius: ".25rem",
    textDecoration: "none",
    justifyContent: "center",

    "&[disabled]": {
        cursor: "not-allowed"
    },

    variants: {
        size: {
            small: {
                padding: ".375rem .625rem"
            }
        },
        theme: {
            primary: {
                color: "#fff",
                background: "#4ebd93",
                "&:hover": {
                    background: "#5da58a"
                },
                "&:active": {
                    background: "#4ebd93"
                },
                "&[disabled]": {
                    color: "#cfcfcf",
                    background: "#578976"
                }
            },
            secondary: {
                color: "#fff",
                border: "1px solid #2a2a2a",
                background: "#2a2a2a",
                "&:hover": {
                    background: "#1f1f1f",
                    borderColor: "#e0e0e00d",
                },
                "&:active": {
                    background: "#2a2a2a"
                },
                "&[disabled]": {
                    color: "#cfcfcf",
                    opacity: 0.5
                }
            },
            tertiary: {
                color: "#fff",
                border: "1px solid #2a2a2a",
                background: "none",
                "&:hover": {
                    borderColor: "#e0e0e00d"
                },
                "&[disabled]": {
                    color: "#cfcfcf",
                    opacity: 0.5
                }
            }
        }
    }
});

export default class Button extends React.Component {
    render() {
        const { size, theme, onClick, disabled } = this.props;
        return (
            <StyledButton {...this.props} size={size ?? "small"} theme={theme ?? "primary"} onClick={(...args) => {
                if(!disabled && onClick)
                    return onClick(...args);
            }} style={{
                ...this.props.style
            }}>
                {this.props.children ?? "Button"}
            </StyledButton>
        );
    }
};