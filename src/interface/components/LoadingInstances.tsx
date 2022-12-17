import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Spinner, Typography } from 'voxeliface';
export default function LoadingInstances() {
	const { t } = useTranslation('interface');
	return <Grid width="100%" spacing={20} justifyContent="center">
		<Spinner/>
		<Typography size={20} weight={400} family="$tertiary" height="fit-content">
			{t('loading_instances')}
		</Typography>
	</Grid>;
};