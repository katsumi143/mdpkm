import React from 'react';
import { styled } from '@stitches/react';
import { CaretRightFill } from 'react-bootstrap-icons';

import Grid from '../components/uiblox/Grid';
import Button from '../components/uiblox/Button';
import Typography from '../components/uiblox/Typography';

import Util from '../common/util';

const StyledInstance = styled(Grid, {
    "& span": {
        width: "100%",
        display: "inline-block",
        overflow: "hidden",
        textAlign: "start",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    },
    "& > div": {
        overflow: "hidden",
        boxShadow: "0 0 4px 2px #00000036"
    }
});

export default class Instance extends React.Component {
    render() {
        const instance = this.props.data;
        return (
            <StyledInstance width="100%" padding="8px 16px" alignItems="start">
                <Grid width="100%" height="100%" padding="8px" spacing="16px" alignItems="center" background="#ffffff05" borderRadius="8px" justifyContent="space-between">
                    <Grid width="calc(100% - 80px)" spacing="16px" alignItems="center">
                        <Grid height="100%">
                            {Util.getInstanceIcon(instance)}
                        </Grid>
                        <Grid width="inherit" direction="vertical" alignItems="start">
                            <Typography text={instance.name} size="1.1rem" width="100%" textalign="start" whitespace="nowrap" style={{
                                overflow: "hidden"
                            }}/>
                            <Typography text={instance.state ?? "Installed"} size="0.9rem" color="#ffffffba" family="Nunito" margin="-2px 0 0 0" textalign="start" whitespace="nowrap"/>
                        </Grid>
                    </Grid>
                    <Grid>
                        <Button theme="secondary" onClick={this.props.onView} disabled={instance.corrupt}>
                            View
                            <CaretRightFill/>
                        </Button>
                    </Grid>
                </Grid>
            </StyledInstance>
        );
    }
};