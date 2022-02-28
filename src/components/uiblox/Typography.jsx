import React from 'react';
import { styled } from '@stitches/react';

const StyledTypography = styled('span', {
    color: "#fff",
    margin: 0,
    display: "flex",
    fontSize: "1rem",
    textAlign: "center",
    fontWeight: 500,
    alignItems: "center"
});

export default class Typography extends React.Component {
    render() {
        const props = this.props;
        return (
            <StyledTypography {...this.props} style={{
                width: props.width,
                color: props.color,
                margin: props.margin,
                height: props.height,
                fontSize: props.size,
                textAlign: props.textalign,
                fontWeight: props.weight ?? 500,
                fontFamily: props.family,
                lineHeight: props.lineheight ?? 1.43,
                whiteSpace: props.whitespace,
                ...props.style
            }}>
                {this.props.text}
                {this.props.children}
            </StyledTypography>
        );
    }
};