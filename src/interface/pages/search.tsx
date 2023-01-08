import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Grid, Typography } from 'voxeliface';

import ImageWrapper from '../components/ImageWrapper';
import PlatformSearch from '../components/platform/search';

import { setPage } from '../../store/slices/interface';
import { useInstance } from '../../voxura';
import { ComponentType, InstanceState } from '../../../voxura';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
export default function SearchPage() {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const instance = useInstance(useAppSelector(state => state.interface.currentInstance));

	if (!instance)
		return null;
	const changePage = (page: string) => dispatch(setPage(page));
	return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical>
		<Grid justifyContent="space-between">
			<Grid vertical>
				<Typography size={20} noSelect>
					{t('platform_search')}
				</Typography>
				<Link size={12} onClick={() => changePage('instances')}>
					<IconBiArrowLeft/>
					{t('common.action.return_to_instances')}
				</Link>
			</Grid>
			{instance.state !== InstanceState.None &&
				<Typography size={14} color="#ffba64" noSelect>
					<IconBiExclamationTriangleFill/>
					{t('mod_management.warning')}
				</Typography>
			}
			<Grid margin="0 16px" spacing={16} alignItems="center">
				<ImageWrapper src={instance.webIcon} size={40} canPreview borderRadius={4}/>
				<Grid spacing={2} vertical>
					<Typography noSelect lineheight={1}>
						{instance.name}
					</Typography>
					<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
						{instance.store.components.filter(c => c.type === ComponentType.Loader).map(c => t(`voxura:component.${c.id}`)).join(', ')}
					</Typography>
				</Grid>
			</Grid>
		</Grid>
		<Grid width="100%" height="100%" margin="16px 0 0" spacing={16} css={{ overflow: 'hidden' }}>
			<PlatformSearch instance={instance}/>
		</Grid>
	</Grid>;
}