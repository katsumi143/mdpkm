import React from 'react';
import { keyframes } from '@stitches/react';

import Grid from '/voxeliface/components/Grid';
import Typography from '/voxeliface/components/Typography';
const animation = keyframes({
    from: {
        transform: 'translateX(120%)'
    },
    to: {
        transform: 'none'
    }
});

export default function Toast({ t, title, body, icon: Icon = IconBiInfoCircle }) {
    return <Grid padding="16px 32px 16px 20px" spacing={16} background="$secondaryBackground" borderRadius={16} css={{
        overflow: 'hidden',
        animation: `${animation} .25s`,
        transform: t.visible ? 'none' : 'translateX(120%)',
        boxShadow: '0 0 16px -12px rgb(0 0 0 / 0.25)',
        transition: 'transform 1.5s'
    }}>
        <Typography>
            <Icon/>
        </Typography>
        <Grid spacing={6} direction="vertical">
            <Typography size=".9rem" lineheight={1}>
                {title ?? 'Toast title'}
            </Typography>
            <Typography size=".8rem" color="$secondaryColor" weight={400} lineheight={1}>
                {body}
            </Typography>
        </Grid>
    </Grid>;
};