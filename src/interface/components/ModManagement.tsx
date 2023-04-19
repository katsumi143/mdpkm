import { open } from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Button, Spinner, TextInput, Typography, BasicSpinner } from 'voxeliface';

import WarningText from './WarningText';
import InstanceMod from './InstanceMod';

import { useAppDispatch } from '../../store/hooks';
import { setPage, setSearchType } from '../../store/slices/interface';
import { Instance, ProjectType, InstanceState } from '../../../voxura';
export interface ModManagementProps {
	instance: Instance
}
export default function ModManagement({ instance }: ModManagementProps) {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const [filter, setFilter] = useState('');
	const items = instance.modifications;
	const loading = instance.readingMods;
	const disabled = instance.state !== InstanceState.None;
	const search = () => {
		dispatch(setPage('search'));
		dispatch(setSearchType(ProjectType.Mod));
	};
	const refresh = () => instance.readMods();
	const openFolder = () => open(instance.modsPath);
	const getUpdates = () => {
		instance.getModUpdates().then(console.log);
	};
	const updateAll = () => {
		instance.updateMods();
	};
	useEffect(() => {
		if (instance.modifications.length === 0)
			instance.readMods();
	}, [instance.id]);
	return <React.Fragment>
		<Grid margin="4px 0" spacing={8} justifyContent="space-between">
			<Grid vertical>
				<Typography size={14} noSelect lineheight={1}>
					{t('mod_management')}
				</Typography>
				<Typography size={12} color="$secondaryColor" weight={400} noSelect>
					{loading ?
						t('common.label.loading') :
						t('common.label.items', { count: items.length })
					}
				</Typography>
			</Grid>
			<Grid spacing={8}>
				<TextInput
					width={256}
					value={filter}
					onChange={setFilter}
					placeholder={t('mod_management.filter')}
				/>
				<Button theme="secondary" onClick={refresh} disabled={loading}>
					{loading ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
					{t('common.action.refresh')}
				</Button>
				<Button theme="secondary" onClick={openFolder}>
					<IconBiFolder2Open/>
					{t('common.action.open_folder')}
				</Button>
			</Grid>
		</Grid>
		<Grid spacing={8} vertical cornerRadius={16} css={{ overflow: 'hidden auto' }}>
			{!loading ? items.length ?
				items.filter(({ id, name }) =>
					id?.toLowerCase().includes(filter) ||
					name?.toLowerCase().includes(filter)
				).sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id)).map(mod =>
					<InstanceMod key={mod.id} mod={mod} instance={instance} disabled={disabled}/>
				)
			: <Typography noSelect>
				{t('common.label.empty_dir')}
			</Typography> : <Spinner/>}
		</Grid>
		<Grid margin="auto 0 16px" spacing={8}>
			<Button theme="accent" onClick={search}>
				<IconBiSearch/>
				{t('mod_management.search')}
			</Button>
			<Button theme="accent" onClick={getUpdates} disabled={loading || instance.gettingModUpdates}>
				{instance.gettingModUpdates ? <BasicSpinner size={16}/> : <IconBiCloudArrowDown/>}
				{t('common.action.check_for_updates')}
			</Button>
			{instance.modUpdates.length > 0 && <Button theme="accent" onClick={updateAll} disabled={loading || instance.updatingMods}>
				<IconBiCloudArrowDown/>
				{t('common.action.update_all')}
			</Button>}
			{instance.state !== InstanceState.None &&
				<WarningText text={t('mod_management.warning')} margin="0 8px 0 auto"/>
			}
		</Grid>
	</React.Fragment>;
}