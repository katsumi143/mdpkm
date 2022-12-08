import { open } from '@tauri-apps/api/shell';
import { removeFile } from '@tauri-apps/api/fs';
import { checkUpdate } from '@tauri-apps/api/updater';
import { open as open2 } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import React, { useState, ReactNode } from 'react';
import { getName, getVersion, getTauriVersion } from '@tauri-apps/api/app';

import BrowserLink from '../components/BrowserLink';
import { GridDirection } from '../../../voxeliface/components/Grid';
import { Grid, Image, Select, Switch, Button, Tooltip, TextInput, TextHeader, Typography, InputLabel, BasicSpinner } from '../../../voxeliface';

import Util from '../../common/util';
import Patcher from '../../plugins/patcher';
import { toast } from '../../util';
import { setPage } from '../../store/slices/interface';
import PluginSystem from '../../plugins';
import { VOXURA_VERSION } from '../../../voxura';
import { PLACEHOLDER_ICON } from '../../util/constants';
import { set, saveSettings } from '../../store/slices/settings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const appName = await getName();
const appVersion = await getVersion();
const tauriVersion = await getTauriVersion();
export default Patcher.register(function Settings() {
	const { t, i18n } = useTranslation();
	const theme = useAppSelector(state => state.settings.theme);
	const uiStyle = useAppSelector(state => state.settings.uiStyle);
	const dispatch = useAppDispatch();
	const language = useAppSelector(state => state.settings.language);
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
			return toast(`Invalid plugin.`);
		}
		await PluginSystem.loadPluginFile(manifest.name, pluginPath);
		setRerender(Date.now());
		toast(`Successfully added ${manifest.name}!`);
	};
	const updateCheck = () => {
		setUpdating(true);
		checkUpdate().then(({ shouldUpdate }) => {
			if (!shouldUpdate)
				toast('No updates available', 'You\'re already up to date!');
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
		<TextHeader>{t('app.mdpkm.settings.general')}</TextHeader>
		<Grid width="30%" spacing={8} padding="0 1rem" vertical>
			<Setting name="general.theme">
				<Select.Root value={theme} onChange={changeTheme}>
					<Select.Group name={t('app.mdpkm.settings.general.theme.category')}>
						<Select.Item value="default">
							{t('app.mdpkm.settings.general.theme.items.default')}
						</Select.Item>
						<Select.Item value="light">
							{t('app.mdpkm.settings.general.theme.items.light')}
						</Select.Item>
						<Select.Item value="dark">
							{t('app.mdpkm.settings.general.theme.items.dark')}
						</Select.Item>
						<Select.Item value="red">
							{t('app.mdpkm.settings.general.theme.items.red')}
						</Select.Item>
						<Select.Item value="orange">
							{t('app.mdpkm.settings.general.theme.items.orange')}
						</Select.Item>
						<Select.Item value="yellow">
							{t('app.mdpkm.settings.general.theme.items.yellow')}
						</Select.Item>
						<Select.Item value="green">
							{t('app.mdpkm.settings.general.theme.items.green')}
						</Select.Item>
						<Select.Item value="blue">
							{t('app.mdpkm.settings.general.theme.items.blue')}
						</Select.Item>
						<Select.Item value="purple">
							{t('app.mdpkm.settings.general.theme.items.purple')}
						</Select.Item>
					</Select.Group>
				</Select.Root>
			</Setting>
			<Setting name="general.uiStyle">
				<Select.Root value={uiStyle} onChange={v => setSetting('uiStyle', v)}>
					<Select.Group name={t('app.mdpkm.settings.general.uiStyle.category')}>
						<Select.Item value="default">
							{t('app.mdpkm.settings.general.uiStyle.items.default')}
						</Select.Item>
						<Select.Item value="compact">
							{t('app.mdpkm.settings.general.uiStyle.items.compact')}
						</Select.Item>
					</Select.Group>
				</Select.Root>
			</Setting>
			<Setting name="general.language" noSummary>
				<Select.Root value={language} onChange={changeLanguage}>
					<Select.Group name={t('app.mdpkm.settings.general.language.category')}>
						<Select.Item value="en">
							{t('app.mdpkm.common:locales:en')}
						</Select.Item>
						<Select.Item value="lv">
							{t('app.mdpkm.common:locales:lv')}
						</Select.Item>
						<Select.Item value="ru">
							{t('app.mdpkm.common:locales:ru')}
						</Select.Item>
					</Select.Group>
				</Select.Root>
			</Setting>
		</Grid>

		<TextHeader spacious>{t('app.mdpkm.settings.instances')}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Setting name="instances.pageBanner" direction="horizontal">
				<Switch
					value={showInstanceBanner}
					onChange={v =>
						setSetting('instances.showBanner', v)
					}
				/>
				<Typography size={13} color="$secondaryColor">
					{t(`app.mdpkm.common:labels.toggle_${showInstanceBanner}`)}
				</Typography>
			</Setting>
			<Setting name="instances.defaultResolution" direction="horizontal">
				<Grid vertical>
					<InputLabel>
						{t('app.mdpkm.instance_page.tabs.settings.resolution.width')}
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
						{t('app.mdpkm.instance_page.tabs.settings.resolution.height')}
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
				<Typography size={13} color="$secondaryColor">
					{t(`app.mdpkm.common:labels.toggle_${modSearchPopout}`)}
				</Typography>
			</Setting>
			<Setting name="instances.modSearchSummaries" direction="horizontal">
				<Switch
					value={modSearchSummaries}
					onChange={v =>
						setSetting('instances.modSearchSummaries', v)
					}
				/>
				<Typography size={13} color="$secondaryColor">
					{t(`app.mdpkm.common:labels.toggle_${modSearchSummaries}`)}
				</Typography>
			</Setting>
		</Grid>

		<TextHeader spacious>{t('app.mdpkm.settings.plugins', {
			val: Object.keys(PluginSystem.loaded).length
		})}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Typography size={14} color="$secondaryColor" weight={400} family="$secondary"><span>
				Not sure how to install a plugin? Check out the <BrowserLink href="https://docs.mdpkm.voxelified.com/docs/tutorials/install-plugin">
					guide
				</BrowserLink>!
			</span></Typography>
			<Grid spacing={8}>
				<Button theme="accent" onClick={addPlugin}>
					<IconBiPlusLg />
					{t('app.mdpkm.settings.plugins.add')}
				</Button>
				<Button theme="secondary" onClick={() => open(PluginSystem.path)}>
					<IconBiFolder2Open />
					{t('app.mdpkm.common:actions.open_folder')}
				</Button>
			</Grid>
			{Object.entries(PluginSystem.loaded).map(([id, plugin]) => {
				const pluginLoaders: any[] = [];//LOADER_MAP.filter(l => l.source?.id === id);
				return <Grid key={id} padding={8} spacing={8} alignItems="center" borderRadius={16} css={{
					border: 'transparent solid 1px',
					position: 'relative',
					background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
				}}>
					<Image src={plugin.icon ?? PLACEHOLDER_ICON} size={48} borderRadius={8} />
					<Grid spacing={2} vertical>
						<Typography lineheight={1}>
							{t(`app.mdpkm.plugin.${plugin.id}:name`)}
						</Typography>
						<Typography size=".8rem" color="$secondaryColor" lineheight={1}>
							{plugin.id} {plugin.version}
						</Typography>
					</Grid>
					<Grid spacing={8} css={{ right: 16, position: 'absolute' }}>
						{pluginLoaders.length > 0 &&
							<Typography size={14} color="$secondaryColor" weight={400}>
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
									{t('app.mdpkm.common:actions.remove')}
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

		<TextHeader spacious>{t('app.mdpkm.settings.about')}</TextHeader>
		<Grid spacing={8} padding="0 1rem" vertical>
			<Grid spacing={8} alignItems="center">
				<Image src="img/icons/brand_default.svg" size={48} onClick={yippee} />
				<Grid spacing={2} vertical>
					<Typography lineheight={1}>
						{appName} v{appVersion}
					</Typography>
					<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
						{t('app.mdpkm.settings.about.tauri', {
							val: tauriVersion
						})} & voxura {VOXURA_VERSION}
					</Typography>
				</Grid>
			</Grid>
			<Grid spacing={8}>
				<Button theme="accent" onClick={updateCheck} disabled={updating}>
					{updating ? <BasicSpinner size={16} /> : <IconBiCloudArrowDown />}
					{t('app.mdpkm.settings.about.check_for_updates')}
				</Button>
				<Button theme="accent" onClick={reportIssue}>
					<IconBiEnvelopeOpen />
					{t('app.mdpkm.settings.about.report_bug')}
				</Button>
				<Button theme="secondary" onClick={openGithub}>
					<IconBiGithub />
					{t('app.mdpkm.settings.about.github')}
				</Button>
			</Grid>
		</Grid>
	</Grid>;
});

type SettingProps = {
	name?: string,
	children?: ReactNode | ReactNode[],
	noSummary?: boolean,
	direction?: GridDirection
};
function Setting({ name, children, direction, noSummary }: SettingProps) {
	const { t } = useTranslation();
	const stringBase = `app.mdpkm.settings.${name ?? 'placeholder'}`;
	return <Grid width="100%" css={{ marginBottom: 16 }}>
		<Grid width="100%" spacing={4} padding={4} vertical>
			<Typography lineheight={1}>
				{t(stringBase)}
			</Typography>
			{!noSummary &&
				<Typography size={14} color="$secondaryColor" weight={400} lineheight={1.2} textalign="start">
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
};