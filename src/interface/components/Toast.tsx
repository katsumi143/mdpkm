import { Trans } from 'react-i18next';
import { Grid, Typography } from 'voxeliface';
import { styled, keyframes } from '@stitches/react';
import type { Toast as HotToast } from 'react-hot-toast';
import React, { FunctionComponent } from 'react';

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

	variants: {
		visible: {
			true: {
				transform: 'none'
			}
		}
	}
});

export interface ToastProps {
    t: HotToast
	id: string
	data: any[]
    icon: FunctionComponent
}
export default function Toast({ t, id, data, icon: Icon = IconBiInfoCircle }: ToastProps) {
	const key = `interface:toast.${id}`;
    return <StyledToast visible={t.visible} smoothing={1} cornerRadius={16}>
        <Typography noSelect>
            <Icon/>
        </Typography>
        <Grid spacing={4} vertical>
            <Typography size={14} noFlex noSelect lineheight={1}>
                <Trans values={data} i18nKey={key}/>
            </Typography>
            <Typography size={12} color="$secondaryColor" noFlex weight={400} family="$secondary" noSelect lineheight={1}>
				<Trans values={data} i18nKey={key + '.body'}/>
            </Typography>
        </Grid>
    </StyledToast>;
}