import { keyframes } from '@stitches/react';
import type { Toast as HotToast } from 'react-hot-toast';
import React, { FunctionComponent } from 'react';

import { Grid, Typography } from '../../../voxeliface';
const animation = keyframes({
    from: {
        transform: 'translateX(120%)'
    },
    to: {
        transform: 'none'
    }
});

export type ToastProps = {
    t: HotToast,
    icon: FunctionComponent,
    body?: string,
    title?: string,
};
export default function Toast({ t, title = 'Toast title', body = 'Toast body', icon: Icon = IconBiInfoCircle }: ToastProps) {
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
                {title}
            </Typography>
            <Typography size=".8rem" color="$secondaryColor" weight={400} lineheight={1}>
                {body}
            </Typography>
        </Grid>
    </Grid>;
};