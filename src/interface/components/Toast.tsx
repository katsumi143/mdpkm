import { styled, keyframes } from '@stitches/react';
import type { Toast as HotToast } from 'react-hot-toast';
import React, { FunctionComponent } from 'react';

import { Grid, Typography } from 'voxeliface';
const animation = keyframes({
    from: {
        transform: 'translateX(120%)'
    },
    to: {
        transform: 'none'
    }
});
const StyledToast = styled(Grid, {
	gap: 16,
	padding: '16px 64px 16px 20px',
	overflow: 'hidden',
	transform: 'translateX(120%)',
	animation: `${animation} .25s`,
	boxShadow: '0 0 16px -12px rgb(0 0 0 / 0.25)',
	transition: 'transform 1.5s',
	background: '$secondaryBackground',
	borderRadius: 16,

	variants: {
		visible: {
			true: {
				transform: 'none'
			}
		}
	}
});

export type ToastProps = {
    t: HotToast,
    icon: FunctionComponent,
    body?: string,
    title?: string,
};
export default function Toast({ t, title = 'Toast title', body = 'Toast body', icon: Icon = IconBiInfoCircle }: ToastProps) {
    return <StyledToast visible={t.visible}>
        <Typography>
            <Icon/>
        </Typography>
        <Grid spacing={4} vertical>
            <Typography size={14} lineheight={1}>
                {title}
            </Typography>
            <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
                {body}
            </Typography>
        </Grid>
    </StyledToast>;
};