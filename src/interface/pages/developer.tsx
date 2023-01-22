import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Grid, Switch, Button, TextInput, Typography, TextHeader, InputLabel } from 'voxeliface';

import ImageWrapper from '../components/ImageWrapper';

import PluginSystem from '../../plugins';
import { useTimeString } from '../../util';
import { set, saveSettings } from '../../store/slices/settings';
import voxura, { useMinecraftAccount } from '../../voxura';
import { InstanceType, COMPONENT_MAP } from '../../../voxura';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import mdpkm, { COMPONENT_EXTRAS, INSTANCE_CREATORS } from '../../mdpkm';
import { APP_DIR, APP_NAME, APP_VERSION, TAURI_VERSION } from '../../util/constants';
import { getDefaultInstanceIcon, getDefaultInstanceBanner } from '../../util';
export default function Developer() {
	const { t } = useTranslation();
	const account = useMinecraftAccount();
	const dispatch = useAppDispatch();
	const [crash, setCrash] = useState<any>(null);
	const [iconTest, setIconTest] = useState('28839');
	const [bannerTest, setBannerTest] = useState('billy is awesome');

	const currentDate = Date.now();
	const showHiddenAuths = useAppSelector(state => state.settings.developer.showHiddenAuthProviders);
	const setSetting = (key: any, value: any) => {
		dispatch(set([key, value]));
		dispatch(saveSettings());
	};
	return <Grid width="100%" height="inherit" padding="12px 1rem" vertical>
		<TextHeader>Developer Stuff</TextHeader>
		<Grid spacing={8}>
			<Button theme="accent" onClick={() => setCrash({})}>
				<IconBiExclamationTriangleFill />
				Crash User Interface {crash}
			</Button>
			<Button theme="accent" onClick={() => location.reload()}>
				Reload application
			</Button>
		</Grid>
		<Grid margin="8px 0 0" spacing={8}>
			<Button theme="accent" onClick={() => voxura.instances.loadInstances()}>
				Reload voxura instances
			</Button>
			<Button theme="accent" onClick={() => voxura.auth.refreshProviders()}>
				Refresh voxura auth providers
			</Button>
		</Grid>

		<InputLabel spaciouser>Default Instance Icon Tester</InputLabel>
		<Grid spacing={8}>
			<ImageWrapper src={getDefaultInstanceIcon(iconTest)} size={32} canPreview/>
			<TextInput
				value={iconTest}
				onChange={setIconTest}
			/>
		</Grid>

		<InputLabel spaciouser>Default Instance Banner Tester</InputLabel>
		<Grid spacing={8}>
			<ImageWrapper src={getDefaultInstanceBanner(bannerTest)} size={64} width={124} ratio={1.96} canPreview previewWidth={768}/>
			<TextInput
				value={bannerTest}
				onChange={setBannerTest}
			/>
		</Grid>

		<InputLabel spaciouser>Show Hidden Auth Providers</InputLabel>
		<Grid>
			<Switch value={showHiddenAuths} onChange={v => setSetting('developer.showHiddenAuthProviders', v)}/>
		</Grid>

		<InputLabel spaciouser>Current Account Information</InputLabel>
		<Grid spacing={32}>
			<Grid vertical>
				<Typography size={14} weight={400} family="$secondary">
					Primary Name: {account?.primaryName}
				</Typography>
				<Typography size={14} weight={400} family="$secondary">
					Secondary Name: {account?.secondaryName}
				</Typography>
			</Grid>
			<Grid vertical>
				<Typography size={14} weight={400} family="$secondary">
					XUID: {account?.xboxAccount.data.xsts.xuid}
				</Typography>
				<Typography size={14} weight={400} family="$secondary">
					Xbox Name: {account?.primaryName}
				</Typography>
				<Typography size={14} weight={400} family="$secondary">
					Minecraft UUID: {account?.data.cachedProfile?.id}
				</Typography>
			</Grid>
		</Grid>
		<Grid vertical>
			<Typography size={14} weight={400} family="$secondary">
				Xbox expires in {useTimeString((account?.xboxAccount.expireDate ?? 0) - currentDate)}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Xbox XSTS expires in {useTimeString((account?.xboxAccount.data.xsts.expireDate ?? 0)  - currentDate)}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Microsoft expires in {useTimeString((account?.msAccount.expireDate ?? 0) - currentDate)}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Minecraft expires in {useTimeString((account?.expireDate ?? 0) - currentDate)}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Minecraft XSTS expires in {useTimeString((account?.data.xsts.expireDate ?? 0) - currentDate)}
			</Typography>
		</Grid>

		<InputLabel spaciouser>mdpkm Information</InputLabel>
		<Grid vertical>
			<Typography size={14} weight={400} family="$secondary">
				News Sources: {mdpkm.newsSources.map(n => n.id).join(', ')}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Instance Creators: {INSTANCE_CREATORS.map(c => c.id).join(', ')}
			</Typography>
		</Grid>

		<InputLabel spaciouser>voxura Information</InputLabel>
		<Grid vertical>
			<Typography size={14} weight={400} family="$secondary">
				Platforms: {Object.keys(voxura.platforms).join(', ')}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Components: {COMPONENT_MAP.length}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Loaded Instances: {voxura.instances.getAll().length}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Root Path: {voxura.rootPath}
			</Typography>
		</Grid>

		<InputLabel spaciouser>Authentication Providers</InputLabel>
		<Grid spacing={16} vertical>
			{voxura.auth.providers.map(({ id, accounts, activeAccount }) =>
				<Typography key={id} size={14} weight={400} family="$secondary">
					[{id}]<br/>
					Active: {activeAccount?.primaryName} ({activeAccount?.id})<br/>
					Accounts: {accounts.length}<br/>
					Translation: {t(`voxura:auth_provider.${id}`)}
				</Typography>
			)}
		</Grid>

		<InputLabel spaciouser>PluginSystem Information</InputLabel>
		<Grid vertical>
			<Typography size={14} weight={400} family="$secondary">
				Path: {PluginSystem.path}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Loaded Plugins: {Object.keys(PluginSystem.loaded).length}
			</Typography>
		</Grid>

		<InputLabel spaciouser>COMPONENT_MAP ({COMPONENT_MAP.length})</InputLabel>
		<Grid spacing={16} vertical>
			{COMPONENT_MAP.map(({ id, instanceTypes }) => <Typography size={14} weight={400} family="$secondary">
				[{id}]<br/>
				translation: {t(`voxura:component.${id}`)}<br/>
				instance types: {instanceTypes.map(t => InstanceType[t]).join(', ')}
			</Typography>)}
		</Grid>

		<InputLabel spaciouser>COMPONENT_EXTRAS ({Object.keys(COMPONENT_EXTRAS).length})</InputLabel>
		<Grid spacing={16} vertical>
			{Object.entries(COMPONENT_EXTRAS).map(([ id, data ]) => <Typography size={14} weight={400} family="$secondary">
				[{id}]<br/>
				contentTabs: {data.contentTabs?.map(t => t.name).join(', ')}<br/>
				settingsTabs: {data.settingsTabs?.map(t => t.name).join(', ')}<br/>
				enabledContentTabs: {data.enabledContentTabs?.join(', ')}
			</Typography>)}
		</Grid>

		<InputLabel spaciouser>INSTANCE_CREATORS ({INSTANCE_CREATORS.length})</InputLabel>
		<Grid spacing={16} vertical>
			{INSTANCE_CREATORS.map(({ id, category }) => <Typography size={14} weight={400} family="$secondary">
				[{id}]<br/>
				category: {category}<br/>
				translation: {t('voxura:component.' + id)}
			</Typography>)}
		</Grid>

		<InputLabel spaciouser>News Sources ({mdpkm.newsSources.length})</InputLabel>
		<Grid vertical>
			{mdpkm.newsSources.map(source => <Typography size={14} weight={400} family="$secondary">
				{source.displayName} ({source.id})
			</Typography>)}
		</Grid>

		<InputLabel spaciouser>Loaded Plugins ({Object.keys(PluginSystem.loaded).length})</InputLabel>
		<Grid vertical>
			{Object.values(PluginSystem.loaded).map(plugin => <Typography size={14} weight={400} family="$secondary">
				{plugin.id} v{plugin.version}
			</Typography>)}
		</Grid>

		<InputLabel spaciouser>Application Information</InputLabel>
		<Grid vertical>
			<Typography size={14} weight={400} family="$secondary">
				APP_NAME: {APP_NAME}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				APP_VERSION: {APP_VERSION}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				APP_DIR: {APP_DIR}
			</Typography>

			<Typography size={14} weight={400} family="$secondary">
				TAURI_VERSION: {TAURI_VERSION}
			</Typography>
		</Grid>
	</Grid>;
}