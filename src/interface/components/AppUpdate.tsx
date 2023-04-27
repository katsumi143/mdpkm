import { lt } from 'semver';
import { open } from '@tauri-apps/api/shell';
import { listen } from '@tauri-apps/api/event';
import { relaunch } from '@tauri-apps/api/process';
import { installUpdate } from '@tauri-apps/api/updater';
import { useTranslation } from 'react-i18next';
import type { UpdateManifest } from '@tauri-apps/api/updater';
import React, { useState, useEffect } from 'react';
import { Grid, Link, Button, Spinner, Typography } from 'voxeliface';

import Modal from './Modal';
import Markdown from './Markdown';
import WarningText from './WarningText';

import mdpkm from '../../mdpkm';
import voxura from '../../voxura';
import { set } from '../../store/slices/settings';
import { APP_VERSION } from '../../util/constants';
import { useAppDispatch } from '../../store/hooks';
import { InstanceState, COMPONENT_MAP } from '../../../voxura';
import { setPage, setAppUpdate, setLaunchError, setCurrentInstance, setMcServerEulaDialog } from '../../store/slices/interface';
export enum UpdateStatus {
	Idle,
	Preparing,
	Downloading,
	Installing,
	Relaunching
}
export interface AppUpdateProps {
	update: UpdateManifest
}
export default function AppUpdate({ update }: AppUpdateProps) {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const [status, setStatus] = useState(UpdateStatus.Idle);
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		let totalLength = 0;
		const unlisten = listen<any>('tauri://update-download-progress', ({ payload }) => {
			totalLength += payload.chunkLength;
			setProgress(totalLength / payload.contentLength);
		});
		return () => { unlisten.then(f => f()); }
	}, []);

	const installing = status > 0;
	const install = async () => {
		setStatus(UpdateStatus.Preparing);
		for (const provider of voxura.auth.providers) {
			provider.accounts = [];
			provider.activeAccount = undefined;
			provider.emitEvent('changed');
		}

		mdpkm.newsSources = [];
		dispatch(set(['showNews', false]));

		dispatch(setPage('home'));
		dispatch(setLaunchError(null));
		dispatch(setCurrentInstance(''));
		dispatch(setMcServerEulaDialog(null));

		for (const instance of voxura.getInstances()) {
			instance.setState(InstanceState.None);
			for (const process of instance.processes)
				await instance.killProcess(process);
		}
		voxura.instances.instances = [];
		voxura.instances.emitEvent('listChanged');

		COMPONENT_MAP.length = 0;
		setStatus(UpdateStatus.Installing);
		await installUpdate();

		setStatus(UpdateStatus.Relaunching);
		relaunch();
	};
	const viewOnline = () => open(`https://github.com/${globalThis.GIT_REPOSITORY}/releases/tag/${update.version}`);
	if (installing)
		return <Modal><Grid spacing={16}>
			<Spinner/>
			<Typography family="$tertiary">
				{t(`app_update.status.${status}`)}
			</Typography>
			<Grid width={`${progress * 100}%`} height="4px" background="$buttonBackground" css={{
				left: 0,
				bottom: 0,
				position: 'absolute',
				transition: 'width 1s'
			}}/>
		</Grid></Modal>;
	return <Modal width="60%">
		<Typography size={24} family="$tertiary">
			{t('app_update')}
		</Typography>
		<Typography color="$secondaryColor" weight={400} family="$secondary" whitespace="pre">
			{t('common.label.version', [update.version])}<br/>
		</Typography>
		<Markdown text={update.body.replace(/### Download .*?\r/g, '')} css={{ marginTop: 16 }}/>
		<Grid margin="auto 0 0" padding="16px 0 0" spacing={8} justifyContent="end">
			<Link size={14} onClick={viewOnline} css={{ marginRight: 'auto' }}>
				{t('app_update.view')}
				<IconBiBoxArrowUpRight fontSize={10}/>
			</Link>
			{lt(update.version, APP_VERSION) && <WarningText text={t('app_update.warning')}/>}
			<Button theme="accent" onClick={install}>
				<IconBiDownload/>
				{t('app_update.install')}
			</Button>
			<Button theme="secondary" onClick={() => dispatch(setAppUpdate(null))}>
				<IconBiXLg/>
				{t('common.action.cancel')}
			</Button>
		</Grid>
	</Modal>;
}