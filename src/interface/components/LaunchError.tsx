import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, Button, Tooltip, Typography } from 'voxeliface';

import Modal from './Modal';
import { useInstance } from '../../voxura';
import { setLaunchError } from '../../store/slices/interface';
export interface LaunchErrorProps {
	data: [string, string, any[] | undefined]
}
export default function LaunchError({ data }: LaunchErrorProps) {
	const { t } = useTranslation('interface');
	const dispatch = useDispatch();
	const instance = useInstance(data[0]);
	if (!instance)
		return null;
	return <Modal>
		<Tooltip.Root delayDuration={1000}>
			<Tooltip.Trigger asChild>
				<Typography size={24} family="$tertiary">
					{t('launch_error')}
				</Typography>
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content style={{ zIndex: 100000 }} sideOffset={32}>
					{data[1]}
					<Tooltip.Arrow/>
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
		<Typography color="$secondaryColor" weight={400} family="$secondary">
			{t([`voxura:launch_error.${data[1]}`, 'error.generic'], data[2] as any) as any}
		</Typography>
		<Grid margin="auto 0 0" padding="16px 0 0" alignItems="end" justifyContent="space-between">
			<Typography size={12} color="$secondaryColor" weight={400} noFlex family="$secondary">
				{t('launch_error.origin', [instance.displayName])}
			</Typography>
			<Button theme="accent" onClick={() => dispatch(setLaunchError(null))}>
				<IconBiXLg/>
				{t('common.action.close')}
			</Button>
		</Grid>
	</Modal>;
}