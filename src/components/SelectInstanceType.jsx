import React from 'react';
import { keyframes } from '@stitches/react';

import Grid from './uiblox/Grid';
import Image from './uiblox/Image';
import Typography from './uiblox/Typography';

const FadeAnimation = keyframes({
    "0%": {
        opacity: 1,
        transform: "none"
    },
    "100%": {
        opacity: 0,
        transform: "scale(0.8)"
    }
});

export default class SelectInstanceType extends React.Component {
    render() {
        const { types, backButton, settingUp } = this.props;
        return (
            <Grid width="100%" padding="24px 0" spacing="16px" direction="vertical" alignItems="center" style={{
                animationName: settingUp ? FadeAnimation : "none",
                animationDuration: "250ms",
                animationFillMode: "forwards",
                animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
                {backButton}
                <Grid margin="0 0 16px 0" direction="vertical" alignItems="center">
                    <Typography size="18px" color="#ffffffa1" weight={400}>
                        Adding New Instance
                    </Typography>
                    <Typography family="Nunito, sans-serif" weight={600}>
                        Select Instance Type
                    </Typography>
                </Grid>
                {types.map((type, index) =>
                    type === "divide" ?
                        <Grid key={index} width="60%" height="2px" margin="8px 0" background="#ffffff0d" borderRadius="1px"/>
                    :
                    <Grid key={index} width="60%" padding="16px 24px" background="#0000001a" borderRadius="4px" alignItems="center" justifyContent="space-between">
                        <Grid alignItems="center">
                            <Image src={type[2]} size="48px" borderRadius="4px" />
                            <Grid margin="0 0 0 24px" direction="vertical" alignItems="start">
                                <Typography text={type[0]} whitespace="nowrap">
                                    {type[4] &&
                                        <Grid height="fit-content" margin="0 0 0 8px" padding="1px 8px" background="#ffffff33" borderRadius="8px">
                                            <Typography text={type[4]} size="0.8rem" color="#ffffffad" weight={600} family="Nunito, sans-serif"/>
                                        </Grid>
                                    }
                                </Typography>
                                <Typography text={type[1]} size="0.8rem" color="#ffffff80" weight={300} whitespace="nowrap"/>
                            </Grid>
                        </Grid>
                        <Grid spacing="8px">
                            {type[3]}
                        </Grid>
                    </Grid>
                )}
            </Grid>
        );
    }
};