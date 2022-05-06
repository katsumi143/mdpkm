import React from 'react';
import { keyframes } from '@stitches/react';
import { CaretRightFill } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import InstanceIcon from './InstanceIcon';

const Animation = keyframes({
    '0%': {
        opacity: 0,
        transform: 'scale(.9) translateY(8px)'
    },
    '100%': {
        opacity: 1,
        transform: 'none'
    }
});

export default function Instance({ css, data: instance, onView }) {
    return (
        <Grid width="100%" padding="4px 16px" alignItems="start" css={{
            opacity: 0,
            animation: `${Animation} 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
            animationFillMode: 'forwards',
            ...css
        }}>
            <Grid width="100%" height="100%" padding="8px" spacing="16px" alignItems="center" background="$primaryBackground" borderRadius="8px" justifyContent="space-between" css={{
                border: '$secondaryBorder solid 1px',
                position: 'relative'
            }}>
                <Grid width="calc(100% - 80px)" spacing="16px" alignItems="center">
                    <InstanceIcon instance={instance}/>
                    <Grid width="inherit" spacing="4px" direction="vertical" alignItems="start">
                        <Typography
                            size="1rem"
                            width="100%"
                            color="$primaryColor"
                            family="Nunito"
                            textalign="start"
                            lineheight={1}
                            whitespace="nowrap"
                            style={{
                                overflow: "hidden"
                            }}
                        >
                            {instance.name}
                        </Typography>
                        <Typography
                            size=".8rem"
                            color="$secondaryColor"
                            weight={400}
                            family="Nunito"
                            textalign="start"
                            lineheight={1}
                            whitespace="nowrap"
                        >
                            {instance.state ?? "Installed"}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid css={{
                    right: 8,
                    position: 'absolute'
                }}>
                    <Button theme="secondary" onClick={onView} disabled={instance.corrupt}>
                        View
                        <CaretRightFill/>
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};