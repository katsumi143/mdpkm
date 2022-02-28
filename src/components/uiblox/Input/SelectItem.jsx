import React from 'react';
import { styled } from '@stitches/react';
import { Check } from 'react-bootstrap-icons';

import Grid from '../Grid';

const StyledSelectItem = styled('div', {
    gap: 16,
    display: "flex",
    padding: "8px 16px",
    transition: "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "pre",
    alignItems: "center",
    borderBottom: "1px solid #343434",
    justifyContent: "space-between",
    backgroundColor: "#181818",

    "&:hover": {
        backgroundColor: "#369973"
    }
});

export default class SelectItem extends React.Component {
    render() {
        return (
            <StyledSelectItem onClick={() => this.props._set(this.props.value)}>
                <Grid width="fit-content" spacing="12px" alignItems="center">
                    {this.props.children}
                </Grid>
                {this.props._sel && <Check size="1.4rem"/>}
            </StyledSelectItem>
        );
    }
};