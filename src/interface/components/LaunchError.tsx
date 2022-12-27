import React from 'react';
import { keyframes } from '@stitches/react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, Button, Portal, Typography } from 'voxeliface';

import { useInstance } from '../../voxura';
import { setLaunchError } from '../../store/slices/interface';
const openAnimation = keyframes({
    '0%': {
        opacity: 0,
        transform: 'scale(1.05)'
    },
    '100%': {
        opacity: 1,
        transform: 'none'
    }
});
const openAnimation2 = keyframes({
    '0%': {
        background: 'transparent'
    },
    '100%': {
        background: '#000000bf'
    }
});

export interface LaunchErrorProps {
	data: [string, string, any[] | undefined]
}
export default function LaunchError({ data }: LaunchErrorProps) {
	const { t } = useTranslation('interface');
	const dispatch = useDispatch();
	const instance = useInstance(data[0]);
	if (!instance)
		return null;
	return <Portal>
		<Grid width="100vw" height="100vh" spacing={8} vertical alignItems="center" background="#000000bf" justifyContent="center" css={{
            top: 0,
            left: 0,
            zIndex: 100000,
            cursor: 'default',
            position: 'absolute',
			animation: `${openAnimation2} .5s`
        }}>
			<Grid width="40%" padding={16} vertical smoothing={1} background="$secondaryBackground2" borderRadius={16} css={{
				animation: `${openAnimation} .5s cubic-bezier(0, 0, 0, 1.0)`
			}}>
				<Typography size={24} family="$tertiary">
					{t('launch_error')}
				</Typography>
				<Typography color="$secondaryColor" weight={400} family="$secondary">
					{t(`voxura:launch_error.${data[1]}`, data[2])}
				</Typography>
				<Grid margin="auto 0 0" padding="16px 0 0" alignItems="end" justifyContent="space-between">
					<Typography size={12} color="$secondaryColor" weight={400} noFlex family="$secondary">
						{t('launch_error.origin', [instance.name])}
					</Typography>
					<Button theme="accent" onClick={() => dispatch(setLaunchError(null))}>
						<IconBiXLg/>
						{t('common.action.close')}
					</Button>
				</Grid>
			</Grid>
		</Grid>
	</Portal>;
}