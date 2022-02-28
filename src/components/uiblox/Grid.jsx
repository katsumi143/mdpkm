import React from 'react';
import { styled } from '@stitches/react';

const StyledGrid = styled('div', {
    display: "flex"
});

export default class Grid extends React.Component {
    render() {
        const props = this.props;
        return (
            <StyledGrid style={{
                gap: props.spacing,
                width: props.width,
                margin: props.margin,
                height: props.height,
                padding: props.padding,
                flexFlow: props.flow,
                flexWrap: {
                    none: "nowrap",
                    wrap: "wrap",
                    reverse: "wrap-reverse"
                }[props.wrap],
                background: props.background,
                alignItems: props.alignItems,
                borderRadius: props.borderRadius,
                alignContent: props.alignContent,
                flexDirection: {
                    horizontal: "row",
                    horizontalReverse: "row-reverse",
                    vertical: "column",
                    verticalReverse: "column-reverse"
                }[props.direction],
                justifyContent: props.justifyContent,
                gridTemplateColumns: props.templateColumns,
                ...props.style
            }}>
                {this.props.children}
            </StyledGrid>
        );
    }
};