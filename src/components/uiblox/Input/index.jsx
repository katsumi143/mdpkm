import React from 'react';
import { styled } from '@stitches/react';

import Grid from '../Grid';

const StyledInput = styled('div', {
    position: "relative"
});

const StyledInputTag = styled('input', {
    color: "rgba(255, 255, 255, 0.8)",
    width: "100%",
    border: "1px solid #343434",
    outline: "none",
    padding: "8px 16px",
    minWidth: 196,
    fontSize: "0.9rem",
    background: "none",
    transition: "border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    fontWeight: 500,
    fontFamily: "HCo Gotham SSm, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif",
    borderRadius: 4,

    "&:read-only": {
        cursor: "default"
    },
    "&:not(:read-only):focus": {
        borderColor: "#797979",
        background: "rgba(255, 255, 255, 0.01)"
    },
    "&:disabled": {
        cursor: "not-allowed",
        opacity: "50%"
    }
});

const StyledButtons = styled(Grid, {
    top: 0,
    right: 0,
    height: "100%",
    padding: ".25rem",
    position: "absolute"
});

export default class ExpInput extends React.Component {
    render() {
        return (
            <StyledInput style={{
                width: this.props.width
            }}>
                <StyledInputTag id={this.props.id} value={this.props.value} onBlur={this.props.onBlur} readOnly={this.props.readOnly} onChange={this.props.onChange} disabled={this.props.disabled} placeholder={this.props.placeholder}/>
                <StyledButtons>
                    {this.props.children}
                </StyledButtons>
            </StyledInput>
        );
    }
};