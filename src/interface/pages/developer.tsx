import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Grid, Button, TextInput, Typography, TextHeader, InputLabel } from 'voxeliface';

import ImageWrapper from '../components/ImageWrapper';

import Patcher from '../../plugins/patcher';
import PluginSystem from '../../plugins';
import { COMPONENT_MAP } from '../../../voxura';
import mdpkm, { INSTANCE_CREATORS } from '../../mdpkm';
import voxura, { useCurrentAccount } from '../../voxura';
import { APP_DIR, APP_NAME, APP_VERSION } from '../../util/constants';
import { toast, getDefaultInstanceIcon, getDefaultInstanceBanner } from '../../util';
export default function Developer() {
	const { t } = useTranslation();
	const account = useCurrentAccount();
	const [crash, setCrash] = useState<any>(null);
	const [iconTest, setIconTest] = useState('28839');
	const [bannerTest, setBannerTest] = useState('billy is awesome');
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
			<Button theme="accent" onClick={() => voxura.auth.loadFromFile()}>
				Reload voxura accounts
			</Button>
			<Button theme="accent" onClick={() => voxura.auth.refreshAccounts()}>
				Refresh voxura accounts (tokens, etc)
			</Button>
		</Grid>
		<Grid margin="8px 0 0" spacing={8}>
			<Button theme="accent" onClick={() => Patcher.patches = {}}>
				<IconBiExclamationTriangleFill />
				Remove all component patches
			</Button>
		</Grid>
		<Grid margin="8px 0" spacing={8}>
			<Button theme="accent" onClick={() => toast('Test Notification', 'hello :)')}>
				Create Test Toast
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
			<ImageWrapper src={getDefaultInstanceBanner(bannerTest)} size={64} width={124} canPreview/>
			<TextInput
				value={bannerTest}
				onChange={setBannerTest}
			/>
		</Grid>

		<InputLabel spaciouser>Current Account Information</InputLabel>
		<Grid vertical>
			<Typography size={14} weight={400} family="$secondary">
				Name: {account?.name}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Real Name: {account?.data.xboxProfile?.realName}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Xbox Name: {account?.xboxName}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Minecraft UUID: {account?.uuid}
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
				Available Accounts: {voxura.auth.accounts.length}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Root Path: {voxura.rootPath}
			</Typography>
		</Grid>

		<InputLabel spaciouser>PluginSystem Information</InputLabel>
		<Grid vertical>
			<Typography size={14} weight={400} family="$secondary">
				Path: {PluginSystem.path}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Patches: {Object.keys(Patcher.patches).length}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Loaded Plugins: {Object.keys(PluginSystem.loaded).length}
			</Typography>
			<Typography size={14} weight={400} family="$secondary">
				Patchable Components: {Object.keys(Patcher.registered).length}
			</Typography>
		</Grid>

		<InputLabel spaciouser>COMPONENT_MAP ({COMPONENT_MAP.length})</InputLabel>
		<Grid vertical>
			{COMPONENT_MAP.map(component => <Typography size={14} weight={400} family="$secondary">
				{component.id} ({component.name})
			</Typography>)}
		</Grid>

		<InputLabel spaciouser>INSTANCE_CREATORS ({INSTANCE_CREATORS.length})</InputLabel>
		<Grid vertical>
			{INSTANCE_CREATORS.map(({ id }) => <Typography size={14} weight={400} family="$secondary">
				{t('voxura:component.' + id)} ({id})
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
				{plugin.id} v{plugin.version} (app v{plugin.minAppVersion} minimum)
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
		</Grid>
	</Grid>;
}