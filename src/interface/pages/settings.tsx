import { open } from '@tauri-apps/api/shell';
import { checkUpdate } from '@tauri-apps/api/updater';
import { open as open2 } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import React, { useState, ReactNode } from 'react';
import { copyFile, createDir, removeFile } from '@tauri-apps/api/fs';
import { Grid, Image, Select, Switch, Button, Tooltip, GridProps, TextInput, TextHeader, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import { setPage } from '../../store/slices/interface';
import PluginSystem from '../../plugins';
import { VOXURA_VERSION } from '../../../voxura';
import { set, saveSettings } from '../../store/slices/settings';
import { i, toast, readTextFileInZip } from '../../util';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { APP_NAME, LANGUAGES, APP_VERSION, TAURI_VERSION, PLACEHOLDER_IMAGE } from '../../util/constants';
export default function Settings() {
	const { t, i18n } = useTranslation('interface');
	const theme = useAppSelector(state => state.settings.theme);
	const dispatch = useAppDispatch();
	const language = useAppSelector(state => state.settings.language);
	const showNews = useAppSelector(state => state.settings.showNews);
	const startPage = useAppSelector(state => state.settings.startPage);
	const instanceResolution = useAppSelector(state => state.settings.instances.resolution.size);
	const [_, setRerender] = useState(0);
	const [updating, setUpdating] = useState(false);
	const changeLanguage = (lang: string) => {
		setSetting('language', lang);
		i18n.changeLanguage(lang);
	};
	const changeTheme = (theme: string) => {
		setSetting('theme', theme);
		dispatch(saveSettings());
	};
	const addPlugin = async () => {
		const path = await open2({
			title: 'Select mdpkm Plugin',
			filters: [{ name: 'mdpkm Plugins', extensions: ['plugin', 'zip'] }]
		});
		if (!path || Array.isArray(path))
			return;
		const split = path.split(/\/+|\\+/);
		const pluginPath = `${PluginSystem.path}/${split.reverse()[0]}`;
		await createDir(PluginSystem.path, { recursive: true });
		await copyFile(path, pluginPath);

		const manifest = await readTextFileInZip(pluginPath, 'manifest.json').then(JSON.parse).catch(console.warn);
		if (!manifest || !manifest.id || !manifest.name) {
			await removeFile(pluginPath);
			return toast('unknown_error');
		}
		await PluginSystem.loadPluginFile(manifest.name, pluginPath);
		setRerender(Date.now());
	};
	const updateCheck = () => {
		setUpdating(true);
		checkUpdate().then(({ shouldUpdate }) => {
			if (!shouldUpdate)
				toast('no_update');
			setUpdating(false);
		});
	};
	const setSetting = (key: any, value: any) => {
		dispatch(set([key, value]));
		dispatch(saveSettings());
	};
	const reportIssue = () => open('https://github.com/Blookerss/mdpkm/issues/new');
	const openGithub = () => open('https://github.com/Blookerss/mdpkm');
	const yippee = () => dispatch(setPage('developer'));
	return <Grid width="100%" height="100%" padding=".75rem 1rem" vertical css={{
		overflow: 'auto'
	}}>
		<TextHeader noSelect>{t('settings.general')}</TextHeader>
		<Setting name="general.theme">
			<Select.Minimal value={theme} onChange={changeTheme}>
				<Select.Group name={t('settings.general.theme.category')}>
					<Select.Item value="default">
						{t('common.theme.default')}
					</Select.Item>
					<Select.Item value="light">
						{t('common.theme.light')}
					</Select.Item>
					<Select.Item value="dark">
						{t('common.theme.dark')}
					</Select.Item>
					<Select.Item value="red">
						{t('common.theme.red')}
					</Select.Item>
					<Select.Item value="orange">
						{t('common.theme.orange')}
					</Select.Item>
					<Select.Item value="yellow">
						{t('common.theme.yellow')}
					</Select.Item>
					<Select.Item value="green">
						{t('common.theme.green')}
					</Select.Item>
					<Select.Item value="blue">
						{t('common.theme.blue')}
					</Select.Item>
					<Select.Item value="purple">
						{t('common.theme.purple')}
					</Select.Item>
				</Select.Group>
			</Select.Minimal>
		</Setting>
		<Setting name="general.startPage">
			<Select.Minimal value={startPage} onChange={v => setSetting('startPage', v)}>
				<Select.Group name={t('settings.general.startPage.category')}>
					<Select.Item value="home">
						{t('navigation.home')}
					</Select.Item>
					<Select.Item value="instances">
						{t('instance_list')}
					</Select.Item>
				</Select.Group>
			</Select.Minimal>
		</Setting>
		<Setting name="general.language" noSummary>
			<Select.Minimal value={language} onChange={changeLanguage}>
				<Select.Group name={t('settings.general.language.category')}>
					{LANGUAGES.map(lang => <Select.Item key={lang} value={lang}>
						{t(`common.locale.${lang}`)}
					</Select.Item>)}
				</Select.Group>
			</Select.Minimal>
		</Setting>
		<Setting name="general.showNews">
			<Grid spacing={8}>
				<Switch
					value={showNews}
					onChange={v => setSetting('showNews', v)}
				/>
				<Typography size={14} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
					{t(`common.label.toggle_${showNews}`)}
				</Typography>
			</Grid>
		</Setting>

		<TextHeader spacious noSelect>{t('settings.instances')}</TextHeader>
		<Setting name="instances.resolution" direction="horizontal">
			<Grid vertical>
				<InputLabel>
					{t('common.label.resolution_width')}
				</InputLabel>
				<TextInput
					width={80}
					value={Math.max(0, instanceResolution[0] || 0).toString()}
					onChange={value =>
						setSetting('instances.resolution.size',
							[parseInt(value), instanceResolution[1]]
						)
					}
				/>
			</Grid>
			<Grid vertical>
				<InputLabel>
					{t('common.label.resolution_height')}
				</InputLabel>
				<TextInput
					width={80}
					value={Math.max(0, instanceResolution[1] || 0).toString()}
					onChange={value =>
						setSetting('instances.resolution.size',
							[instanceResolution[0], parseInt(value)]
						)
					}
				/>
			</Grid>
		</Setting>

		<TextHeader spacious noSelect>{t('settings.plugins')}</TextHeader>
		{Object.values(PluginSystem.loaded).map(plugin =>
			<Grid key={plugin.id} margin="0 0 8px" padding={8} spacing={8} smoothing={1} alignItems="center" borderRadius={16} css={{
				border: 'transparent solid 1px',
				position: 'relative',
				background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
			}}>
				<Image src={plugin.icon ?? PLACEHOLDER_IMAGE} size={48} borderRadius={8} />
				<Grid spacing={2} vertical>
					<Typography noSelect lineheight={1}>
						{t(`mdpkm:plugin.${plugin.id}`)}
					</Typography>
					<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
						{t('common.label.version', [plugin.version])}
					</Typography>
				</Grid>
				<Grid spacing={8} css={{ right: 16, position: 'absolute' }}>
					<Tooltip.Root delayDuration={250}>
						<Tooltip.Trigger asChild>
							<Button theme="secondary" disabled>
								<IconBiTrash3Fill />
								{t('common.action.remove')}
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content side="top" sideOffset={4}>
							<Tooltip.Arrow />
							{t('app.mdpkm.common:tooltips.feature_unavailable')}
						</Tooltip.Content>
					</Tooltip.Root>
				</Grid>
			</Grid>
		)}
		<Grid margin="8px 0 0" spacing={8}>
			<Button theme="accent" onClick={addPlugin}>
				<IconBiPlusLg/>
				{t('settings.plugins.add')}
			</Button>
			<Button theme="secondary" onClick={() => open(PluginSystem.path)}>
				<IconBiFolder2Open/>
				{t('common.action.open_folder')}
			</Button>
		</Grid>

		<TextHeader spacious noSelect>{t('settings.about')}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Grid spacing={8} alignItems="center">
				<Image src={i('app_icon')} size={48} onClick={yippee} />
				<Grid spacing={2} vertical>
					<Typography noSelect lineheight={1}>
						{t('settings.about.version', [APP_NAME, APP_VERSION])}
					</Typography>
					<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
						{t('settings.about.version2', [TAURI_VERSION, VOXURA_VERSION])}
					</Typography>
				</Grid>
			</Grid>
			<Grid spacing={8}>
				<Button theme="accent" onClick={updateCheck} disabled={updating}>
					{updating ? <BasicSpinner size={16} /> : <IconBiCloudArrowDown />}
					{t('common.action.check_for_updates')}
				</Button>
				<Button theme="accent" onClick={reportIssue}>
					<IconBiEnvelopeOpen />
					{t('settings.about.report_bug')}
				</Button>
				<Button theme="secondary" onClick={openGithub}>
					<IconBiGithub />
					{t('settings.about.github')}
				</Button>
			</Grid>
		</Grid>
	</Grid>;
}

export interface SettingProps {
	name?: string
	children?: ReactNode | ReactNode[]
	noSummary?: boolean
	direction?: GridProps["direction"]
}
export function Setting({ name, children, direction, noSummary }: SettingProps) {
	const { t } = useTranslation('interface');
	const stringBase = `settings.${name ?? 'placeholder'}`;
	return <Grid width="30%" padding="0 1rem 16px">
		<Grid width="100%" spacing={4} padding={4} vertical>
			<Typography noSelect lineheight={1}>
				{t(stringBase)}
			</Typography>
			{!noSummary &&
				<Typography size={14} color="$secondaryColor" weight={400} noSelect lineheight={1.2} textalign="start">
					{t(`${stringBase}.summary`)}
				</Typography>
			}
			<Grid margin="8px 0 0" spacing={8} direction={direction ?? 'vertical'} css={{
				minWidth: 196,
				position: 'relative'
			}}>
				{children}
			</Grid>
		</Grid>
	</Grid>
}