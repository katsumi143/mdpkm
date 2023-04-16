import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Grid, Typography } from 'voxeliface';

import Avatar from '../components/Avatar';
import WarningText from '../components/WarningText';
import PlatformSearch from '../components/platform/search';

import { setPage } from '../../store/slices/interface';
import { useInstance } from '../../voxura';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ProjectType, ComponentType, InstanceState } from '../../../voxura';
export default function SearchPage() {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const instance = useInstance(useAppSelector(state => state.interface.currentInstance));
	const projectType = useAppSelector(state => state.interface.searchType);

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
			{projectType === ProjectType.Mod && instance.state !== InstanceState.None &&
				<WarningText text={t('mod_management.warning')} margin={0}/>
			}
			<Grid margin="0 16px" spacing={12} alignItems="center">
				<Avatar src={instance.webIcon} size="sm"/>
				<Grid spacing={2} vertical>
					<Typography noSelect lineheight={1}>
						{instance.displayName}
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