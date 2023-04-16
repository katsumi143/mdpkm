import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Button, Typography } from 'voxeliface';

import { setPage } from '../../store/slices/interface';
import { useAppDispatch } from '../../store';
import { useMinecraftAccount } from '../../voxura';
export default function MicrosoftBlocker() {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const changePage = (page: string) => dispatch(setPage(page));
	return <Grid margin="auto" spacing={8} vertical alignItems="center">
		<Typography size={16} margin="auto">
			{t('ms_blocker.body')}
		</Typography>
		<Grid spacing={8}>
			<Button theme="accent" onClick={() => changePage('accounts')}>
				<IconBiPerson/>
				{t('ms_blocker.view')}
			</Button>
			<Button theme="secondary" onClick={() => changePage('home')}>
				<IconBiArrowLeft/>
				{t('ms_blocker.back')}
			</Button>
		</Grid>
	</Grid>;
}

export function msProtect(func: (...args: any[]) => any) {
	return (...args: any[]) => {
		const account = useMinecraftAccount();
		if (account)
			return func(...args);
		return <MicrosoftBlocker/>;
	};
}