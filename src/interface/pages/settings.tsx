import { open } from '@tauri-apps/api/shell';
import { removeFile } from '@tauri-apps/api/fs';
import { checkUpdate } from '@tauri-apps/api/updater';
import { open as open2 } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import type { GridDirection } from 'voxeliface/components/Grid';
import React, { useState, ReactNode } from 'react';
import { Grid, Image, Select, Switch, Button, Tooltip, TextInput, TextHeader, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import BrowserLink from '../components/BrowserLink';
import Util from '../../common/util';
import { toast } from '../../util';
import { setPage } from '../../store/slices/interface';
import PluginSystem from '../../plugins';
import { VOXURA_VERSION } from '../../../voxura';
import { set, saveSettings } from '../../store/slices/settings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { APP_NAME, APP_VERSION, TAURI_VERSION, PLACEHOLDER_ICON } from '../../util/constants';

export default function Settings() {
	const { t, i18n } = useTranslation('interface');
	const theme = useAppSelector(state => state.settings.theme);
	const uiStyle = useAppSelector(state => state.settings.uiStyle);
	const dispatch = useAppDispatch();
	const language = useAppSelector(state => state.settings.language);
	const useSymlinks = useAppSelector(state => state.settings['download.useLinks']);
	const modSearchPopout = useAppSelector(state => state.settings['instances.modSearchPopout']);
	const showInstanceBanner = useAppSelector(state => state.settings['instances.showBanner']);
	const modSearchSummaries = useAppSelector(state => state.settings['instances.modSearchSummaries']);
	const defaultInstanceResolution = useAppSelector(state => state.settings['instances.defaultResolution']);
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
		await Util.createDirAll(PluginSystem.path);
		await Util.moveFolder(path, pluginPath);

		const manifest = await Util.readFileInZip(pluginPath, 'manifest.json').then(JSON.parse).catch(console.warn);
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
		<Grid width="30%" spacing={8} padding="0 1rem" vertical>
			<Setting name="general.theme">
				<Select.Minimal value={theme} onChange={changeTheme}>
					<Select.Group name={t('app.mdpkm.settings.general.theme.category')}>
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
			<Setting name="general.uiStyle">
				<Select.Minimal value={uiStyle} onChange={v => setSetting('uiStyle', v)}>
					<Select.Group name={t('app.mdpkm.settings.general.uiStyle.category')}>
						<Select.Item value="default">
							{t('app.mdpkm.settings.general.uiStyle.items.default')}
						</Select.Item>
						<Select.Item value="compact">
							{t('app.mdpkm.settings.general.uiStyle.items.compact')}
						</Select.Item>
					</Select.Group>
				</Select.Minimal>
			</Setting>
			<Setting name="general.language" noSummary>
				<Select.Minimal value={language} onChange={changeLanguage}>
					<Select.Group name={t('app.mdpkm.settings.general.language.category')}>
						<Select.Item value="en">
							{t('common.locale.en')}
						</Select.Item>
						<Select.Item value="lv">
							{t('common.locale.lv')}
						</Select.Item>
						<Select.Item value="ru">
							{t('common.locale.ru')}
						</Select.Item>
					</Select.Group>
				</Select.Minimal>
			</Setting>
		</Grid>

		<TextHeader spacious noSelect>{t('settings.instances')}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Setting name="instances.pageBanner" direction="horizontal">
				<Switch
					value={showInstanceBanner}
					onChange={v =>
						setSetting('instances.showBanner', v)
					}
				/>
				<Typography size={13} color="$secondaryColor" noSelect>
					{t(`common.label.toggle_${showInstanceBanner}`)}
				</Typography>
			</Setting>
			<Setting name="instances.defaultResolution" direction="horizontal">
				<Grid vertical>
					<InputLabel>
						{t('common.label.resolution_width')}
					</InputLabel>
					<TextInput
						width={80}
						value={Math.max(0, defaultInstanceResolution[0] || 0).toString()}
						onChange={value =>
							setSetting('instances.defaultResolution',
								[parseInt(value), defaultInstanceResolution[1]]
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
						value={Math.max(0, defaultInstanceResolution[1] || 0).toString()}
						onChange={value =>
							setSetting('instances.defaultResolution',
								[defaultInstanceResolution[0], parseInt(value)]
							)
						}
					/>
				</Grid>
			</Setting>
			<Setting name="instances.modSearchPopout" direction="horizontal">
				<Switch
					value={modSearchPopout}
					onChange={v =>
						setSetting('instances.modSearchPopout', v)
					}
				/>
				<Typography size={13} color="$secondaryColor" noSelect>
					{t(`common.label.toggle_${modSearchPopout}`)}
				</Typography>
			</Setting>
			<Setting name="instances.modSearchSummaries" direction="horizontal">
				<Switch
					value={modSearchSummaries}
					onChange={v =>
						setSetting('instances.modSearchSummaries', v)
					}
				/>
				<Typography size={13} color="$secondaryColor" noSelect>
					{t(`common.label.toggle_${modSearchSummaries}`)}
				</Typography>
			</Setting>
		</Grid>

		<TextHeader spacious noSelect>{t('settings.download')}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Setting name="download.useLinks" direction="horizontal">
				<Switch
					value={useSymlinks}
					onChange={v => setSetting('download.useLinks', v)}
				/>
				<Typography size={13} color="$secondaryColor" noSelect>
					{t(`common.label.toggle_${useSymlinks}`)}
				</Typography>
			</Setting>
		</Grid>

		<TextHeader spacious noSelect>{t('settings.plugins', {
			val: Object.keys(PluginSystem.loaded).length
		})}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Typography size={14} color="$secondaryColor" weight={400} family="$secondary" noSelect><span>
				Not sure how to install a plugin? Check out the <BrowserLink href="https://docs.mdpkm.voxelified.com/docs/tutorials/install-plugin">
					guide
				</BrowserLink>!
			</span></Typography>
			<Grid spacing={8}>
				<Button theme="accent" onClick={addPlugin}>
					<IconBiPlusLg/>
					{t('settings.plugins.add')}
				</Button>
				<Button theme="secondary" onClick={() => open(PluginSystem.path)}>
					<IconBiFolder2Open/>
					{t('common.action.open_folder')}
				</Button>
			</Grid>
			{Object.entries(PluginSystem.loaded).map(([id, plugin]) => {
				const pluginLoaders: any[] = [];//LOADER_MAP.filter(l => l.source?.id === id);
				return <Grid key={id} padding={8} spacing={8} smoothing={1} alignItems="center" borderRadius={16} css={{
					border: 'transparent solid 1px',
					position: 'relative',
					background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
				}}>
					<Image src={plugin.icon ?? PLACEHOLDER_ICON} size={48} borderRadius={8} />
					<Grid spacing={2} vertical>
						<Typography noSelect lineheight={1}>
							{t(`app.mdpkm.plugin.${plugin.id}:name`)}
						</Typography>
						<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
							{t('common.label.version', [plugin.version])}
						</Typography>
					</Grid>
					<Grid spacing={8} css={{ right: 16, position: 'absolute' }}>
						{pluginLoaders.length > 0 &&
							<Typography size={14} color="$secondaryColor" weight={400} noSelect>
								{pluginLoaders.map(({ icon }, key) =>
									<Image key={key} src={icon} size={20} background="$primaryBackground" borderRadius={4} />
								)}
								{t(`app.mdpkm.settings.plugins.item.adds_loader${pluginLoaders.length > 1 ? 's' : ''}`, {
									val: pluginLoaders.length
								})}
							</Typography>
						}
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
			})}
		</Grid>

		<TextHeader spacious noSelect>{t('settings.about')}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Grid spacing={8} alignItems="center">
				<Image src="img/icons/brand_default.svg" size={48} onClick={yippee} />
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
					{t('settings.about.update')}
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
	direction?: GridDirection
}
export function Setting({ name, children, direction, noSummary }: SettingProps) {
	const { t } = useTranslation('interface');
	const stringBase = `settings.${name ?? 'placeholder'}`;
	return <Grid width="100%" css={{ marginBottom: 16 }}>
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