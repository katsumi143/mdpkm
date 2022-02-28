import React from 'react';
import { styled } from '@stitches/react';

import Grid from './Grid';

const StyledImage = styled(Grid, {
    objectFit: "fill"
});

export default class Image extends React.Component {
    render() {
        return (
            <StyledImage alignItems="center" justifyContent="center" {...this.props} style={{
                width: this.props.width ?? this.props.size,
                height: this.props.height ?? this.props.size,
                borderRadius: this.props.borderRadius,
                backgroundSize: "contain",
                backgroundImage: `url(${this.props.src})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                ...this.props.style
            }}>
                {this.props.children}
            </StyledImage>
        );
    }
};