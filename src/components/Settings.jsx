import React, { useState } from 'react';
import pMap from 'p-map-browser';
import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/shell';
import { checkUpdate } from '@tauri-apps/api/updater';
import { useTranslation } from 'react-i18next';
import { getName, getVersion, getTauriVersion } from '@tauri-apps/api/app';
import { open as open2 } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { useSelector, useDispatch } from 'react-redux';
import { PlusLg, Github, Trash3Fill, Folder2Open, EnvelopeOpen, CloudArrowDown } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Toggle from './Toggle';
import Button from '/voxeliface/components/Button';
import Header from '/voxeliface/components/Typography/Header';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import BrowserLink from './BrowserLink';
import * as Select from '/voxeliface/components/Input/Select';
import ThemeContext from '/voxeliface/contexts/theme';
import * as Tooltip from '/voxeliface/components/Tooltip';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Util from '../common/util';
import Plugins from '../common/plugins';
import Patcher from '/src/common/plugins/patcher';
import Instances from '../common/instances';
import PluginLoader from '../common/plugins/loader';
import { SKIN_API_BASE, MINECRAFT_RESOURCES_URL } from '../common/constants';
import { set, setTheme, setLanguage, saveSettings } from '../common/slices/settings';
import { addAccount, setAccount, saveAccounts, removeAccount, setAddingAccount } from '../common/slices/accounts';

const appName = await getName();
const appVersion = await getVersion();
const tauriVersion = await getTauriVersion()
export default Patcher.register(function Settings() {
    const { t, i18n } = useTranslation();
    const theme = useSelector(state => state.settings.theme);
    const uiStyle = useSelector(state => state.settings.uiStyle);
    const account = useSelector(state => state.accounts.selected);
    const accounts = useSelector(state => state.accounts.data);
    const dispatch = useDispatch();
    const language = useSelector(state => state.settings.language);
    const addingAccount = useSelector(state => state.accounts.addingAccount);
    const showInstanceBanner = useSelector(state => state.settings['instances.showBanner']);
    const defaultInstanceResolution = useSelector(state => state.settings['instances.defaultResolution']);
    const [_, setRerender] = useState();
    const [cleaning, setCleaning] = useState();
    const [updating, setUpdating] = useState(false);
    const cleanInstallation = async() => {
        setCleaning(true);
        const loaders = [];
        const checked = [];
        const libraries = [];
        for (const instance of Instances.instances) {
            try {
                const { loader } = await instance.getConfig();
                const loaderDir = `${loader.type}-${loader.game}-${loader.version}`;
                const loaderPath = `${Instances.getPath('versions')}/${loaderDir}/manifest.json`;
                if (await Util.fileExists(loaderPath)) {
                    loaders.push(loaderDir);

                    const manifest = await Util.readTextFile(loaderPath).then(JSON.parse);
                    libraries.push(...Util.mapLibraries(manifest.libraries, Instances.getPath('libraries')));
                }

                if (!checked.some(c => c === loader.game)) {
                    const javaDir = `java-${loader.game}`;
                    const javaPath = `${Instances.getPath('versions')}/${javaDir}/manifest.json`;
                    if (await Util.fileExists(javaPath)) {
                        loaders.push(javaPath);

                        const manifest = await Util.readTextFile(javaPath).then(JSON.parse);
                        libraries.push(...Util.mapLibraries(manifest.libraries, Instances.getPath('libraries')));

                        libraries.push({
                            url: manifest.downloads.client.url,
                            sha1: manifest.downloads.client.sha1,
                            path: `${Instances.getPath('mcVersions')}/${manifest.id}.jar`
                        });

                        const assets = await Util.readTextFile(`${Instances.getPath('mcAssets')}/indexes/${manifest.assets}.json`).then(JSON.parse);
                        libraries.push(...Object.values(assets.objects).map(
                            ({ hash }) => ({
                                url: `${MINECRAFT_RESOURCES_URL}/${hash.substring(0, 2)}/${hash}`,
                                sha1: hash,
                                path: `${Instances.getPath('mcAssets')}/objects/${hash.substring(0, 2)}/${hash}`
                            })
                        ));
                    }
                    checked.push(loader.game);
                }
            } catch(err) {
                console.error(err);
            }
        }
        let removed = 0;
        await pMap(
            await Util.readDirRecursive(Instances.getPath('libraries')),
            ({ path, isDir }) => {
                if (isDir || libraries.some(l => l.path.replace(/\/+|\\+/g, '/') === path.replace(/\/+|\\+/g, '/')))
                    return;
                return Util.removeFile(path).then(() => removed++).catch(console.warn);
            },
            { concurrency: 30 }
        );
        await pMap(
            await Util.readDirRecursive(Instances.getPath('versions')),
            ({ name, path, isDir }) => {
                if (!isDir || loaders.some(l => l === name))
                    return;
                return Util.removeDir(path).then(() => removed++).catch(console.warn);
            },
            { concurrency: 30 }
        );
        toast.success(`Removed ${removed} files.`);
        setCleaning(false);
    };
    const changeLanguage = lang => {
        dispatch(setLanguage(lang));
        dispatch(saveSettings());
        i18n.changeLanguage(lang);
    };
    const changeTheme = (theme, update) => {
        dispatch(setTheme(theme));
        dispatch(saveSettings());
        update(theme);
    };
    const addPlugin = async() => {
        const path = await open2({
            title: 'Select mdpkm Plugin',
            filters: [{ name: 'mdpkm Plugins', extensions: ['plugin', 'zip'] }]
        });
        const split = path.split(/\/+|\\+/);
        const pluginPath = `${Plugins.path}/${split.reverse()[0]}`;
        await Util.createDirAll(Plugins.path);
        await Util.moveFolder(path, pluginPath);

        const manifest = await Util.readFileInZip(pluginPath, 'manifest.json').then(JSON.parse).catch(console.warn);
        if(!manifest || !manifest.id || !manifest.name) {
            await Util.removeFile(pluginPath);
            return toast.error(`Invalid plugin.`);
        }
        await PluginLoader.loadPluginFile(manifest.name, pluginPath);
        setRerender(Date.now());
        toast.success(`Successfully added ${manifest.name}!`, { duration: 5000 });
    };
    const updateCheck = () => {
        setUpdating(true);
        checkUpdate().then(({ shouldUpdate }) => {
            if (!shouldUpdate)
                toast.success('You\'re already up to date!', { duration: 5000 });
            setUpdating(false);
        });
    };
    const setSetting = (key, value) => {
        dispatch(set([key, value]));
        dispatch(saveSettings());
    };
    const reportIssue = () => open('https://github.com/Blookerss/mdpkm/issues/new');
    const openGithub = () => open('https://github.com/Blookerss/mdpkm');
    return (
        <ThemeContext.Consumer>
            {({ setTheme }) => (
                <Grid width="100%" direction="vertical">
                    <Grid width="100%" height="-webkit-fill-available" padding=".75rem 1rem" direction="vertical" css={{
                        overflow: 'auto'
                    }}>
                        <Header>{t('app.mdpkm.settings.general')}</Header>
                        <Grid spacing={8} padding="0 1rem" direction="vertical">
                            <Setting name="general.theme">
                                <Select.Root value={theme} onChange={v => changeTheme(v, setTheme)}>
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
                                        <Select.Item value="purple">
                                            {t('app.mdpkm.settings.general.theme.items.purple')}
                                        </Select.Item>
                                        <Select.Item value="blue">
                                            {t('app.mdpkm.settings.general.theme.items.blue')}
                                        </Select.Item>
                                        <Select.Item value="green">
                                            {t('app.mdpkm.settings.general.theme.items.green')}
                                        </Select.Item>
                                        <Select.Item value="yellow">
                                            {t('app.mdpkm.settings.general.theme.items.yellow')}
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

                        <Header spacious>{t('app.mdpkm.settings.instances')}</Header>
                        <Grid spacing={8} padding="0 1rem" direction="vertical">
                            <Setting name="instances.pageBanner" direction="horizontal">
                                <Toggle
                                    size="small"
                                    value={showInstanceBanner}
                                    onChange={() =>
                                        setSetting('instances.showBanner', !showInstanceBanner)
                                    }
                                />
                                <Typography size=".8rem" color="$secondaryColor" family="Nunito">
                                    {showInstanceBanner ? 'On' : 'Off'}
                                </Typography>
                            </Setting>
                            <Setting name="instances.defaultResolution" direction="horizontal">
                                <Grid direction="vertical">
                                    <Typography size=".8rem" color="$secondaryColor" family="Nunito">
                                        {t('app.mdpkm.instance_page.tabs.settings.resolution.width')}
                                    </Typography>
                                    <TextInput
                                        width={80}
                                        value={Math.max(0, defaultInstanceResolution[0] || 0)}
                                        onChange={value =>
                                            setSetting('instances.defaultResolution',
                                                [parseInt(value), defaultInstanceResolution[1]]
                                            )
                                        }
                                    />
                                </Grid>
                                <Grid direction="vertical">
                                    <Typography size=".8rem" color="$secondaryColor" family="Nunito">
                                        {t('app.mdpkm.instance_page.tabs.settings.resolution.height')}
                                    </Typography>
                                    <TextInput
                                        width={80}
                                        value={Math.max(0, defaultInstanceResolution[1] || 0)}
                                        onChange={value =>
                                            setSetting('instances.defaultResolution',
                                                [defaultInstanceResolution[0], parseInt(value)]
                                            )
                                        }
                                    />
                                </Grid>
                            </Setting>
                        </Grid>

                        <Header spacious>{t('app.mdpkm.settings.plugins', {
                            val: Object.keys(PluginLoader.loaded).length
                        })}</Header>
                        <Grid spacing={8} padding="0 1rem" direction="vertical">
                            <Typography size=".8rem" color="$secondaryColor"><span>
                                Not sure how to install a plugin? Check out the <BrowserLink href="https://docs.mdpkm.voxelified.com/docs/tutorials/install-plugin">
                                    guide
                                </BrowserLink>!
                            </span></Typography>
                            <Grid spacing={8}>
                                <Button theme="accent" onClick={addPlugin}>
                                    <PlusLg/>
                                    {t('app.mdpkm.settings.plugins.add')}
                                </Button>
                                <Button theme="secondary" onClick={() => open(Plugins.path)}>
                                    <Folder2Open/>
                                    {t('app.mdpkm.common:actions.open_folder')}
                                </Button>
                            </Grid>
                            {Object.entries(PluginLoader.loaded).map(([id, { path, manifest }]) => {
                                const pluginLoaders = API.loaders.filter(l => l.source?.id === id);
                                return <Grid key={id} padding={8} spacing={8} background="$secondaryBackground" alignItems="center" borderRadius={8} css={{
                                    position: 'relative'
                                }}>
                                    <Image src={convertFileSrc(`${path}/icon.svg`)} size={48} background="$primaryBackground" borderRadius={4}/>
                                    <Grid spacing={2} direction="vertical">
                                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                                            {t(`app.mdpkm.plugin.${manifest.id}:name`)}
                                        </Typography>
                                        <Typography size=".8rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                                            {manifest.id} {manifest.version}
                                        </Typography>
                                    </Grid>
                                    <Grid spacing={8} css={{
                                        right: 16,
                                        position: 'absolute'
                                    }}>
                                        {pluginLoaders.length > 0 &&
                                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" spacing={8} horizontal>
                                                {pluginLoaders.map(({ icon }, key) =>
                                                    <Image key={key} src={icon} size={20} background="$primaryBackground" borderRadius={4}/>
                                                )}
                                                {t(`app.mdpkm.settings.plugins.item.adds_loader${t > 1 ? 's' : ''}`, {
                                                    val: pluginLoaders.length
                                                })}
                                            </Typography>
                                        }
                                        <Tooltip.Root delayDuration={250}>
                                            <Tooltip.Trigger asChild>
                                                <Button theme="secondary" disabled>
                                                    <Trash3Fill/>
                                                    {t('app.mdpkm.common:actions.remove')}
                                                </Button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content side="top" sideOffset={4}>
                                                <Tooltip.Arrow/>
                                                {t('app.mdpkm.common:tooltips.feature_unavailable')}
                                            </Tooltip.Content>
                                        </Tooltip.Root>
                                    </Grid>
                                </Grid>
                            })}
                        </Grid>

                        <Header spacious>{t('app.mdpkm.settings.storage')}</Header>
                        <Grid spacing={8} padding="0 1rem" direction="vertical">
                            <Typography size=".9rem" color="$primaryColor" family="Nunito">
                                {t('app.mdpkm.settings.storage.clean_header', {
                                    appName
                                })}
                            </Typography>
                            <Tooltip.Root delayDuration={250}>
                                <Tooltip.Trigger asChild>
                                    <Button theme="accent" onClick={cleanInstallation} disabled>
                                        {t('app.mdpkm.settings.storage.clean')}
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content side="top" sideOffset={4}>
                                    <Tooltip.Arrow/>
                                    {t('app.mdpkm.common:tooltips.feature_unavailable')}
                                </Tooltip.Content>
                            </Tooltip.Root>
                            {cleaning &&
                                <Grid width="100%" height="100%" alignItems="center" background="$primaryBackground" borderRadius={8} justifyContent="center" css={{
                                    top: 0,
                                    left: 0,
                                    zIndex: 10000,
                                    position: 'fixed'
                                }}>
                                    <Grid width="40%" height="fit-content" padding="1rem" spacing={4} direction="vertical" background="$secondaryBackground" borderRadius={8}>
                                        <Typography size="1.1rem" color="$primaryColor" weight={600} family="Nunito Sans" lineheight={1}>
                                            Cleaning {appName} Installation
                                        </Typography>
                                        <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                            Do not close the application!
                                        </Typography>
                                    </Grid>
                                </Grid>
                            }
                        </Grid>

                        <Header spacious>{t('app.mdpkm.settings.about')}</Header>
                        <Grid spacing={8} padding="0 1rem" direction="vertical">
                            <Grid spacing={8} alignItems="center">
                                <Image src="img/icons/brand_default.svg" size={48}/>
                                <Grid spacing={2} direction="vertical">
                                    <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                                        {appName} v{appVersion}
                                    </Typography>
                                    <Typography size=".7rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                                        {t('app.mdpkm.settings.about.tauri', {
                                            val: tauriVersion
                                        })}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid spacing={8}>
                                <Button theme="accent" onClick={updateCheck} disabled={updating}>
                                    {updating ? <BasicSpinner size={16}/> : <CloudArrowDown size={14}/>}
                                    {t('app.mdpkm.settings.about.check_for_updates')}
                                </Button>
                                <Button theme="accent" onClick={reportIssue}>
                                    <EnvelopeOpen size={14}/>
                                    {t('app.mdpkm.settings.about.report_bug')}
                                </Button>
                                <Button theme="secondary" onClick={openGithub}>
                                    <Github size={14}/>
                                    {t('app.mdpkm.settings.about.github')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </ThemeContext.Consumer>
    );
});

function Setting({ name, children, direction, noSummary }) {
    const { t } = useTranslation();
    const stringBase = `app.mdpkm.settings.${name ?? 'placeholder'}`;
    return <Grid css={{
        marginBottom: 8
    }}>
        <Grid spacing={4} padding=".5rem .6rem" direction="vertical">
            <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                {t(stringBase)}
            </Typography>
            {!noSummary &&
                <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1.2} whitespace="pre-wrap" textalign="start">
                    {t(`${stringBase}.summary`)}
                </Typography>
            }
            <Grid margin=".5rem 0 0" spacing={8} direction={direction ?? 'vertical'} css={{
                minWidth: 196,
                position: 'relative'
            }}>
                {children}
            </Grid>
        </Grid>
    </Grid>
};