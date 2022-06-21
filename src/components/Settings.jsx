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
import { XLg, PlusLg, Github, Trash3Fill, Folder2Open, EnvelopeOpen, CloudArrowDown } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Toggle from './Toggle';
import Button from '/voxeliface/components/Button';
import Header from '/voxeliface/components/Typography/Header';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import InputLabel from '/voxeliface/components/Input/Label';
import * as Select from '/voxeliface/components/Input/Select';
import ThemeContext from '/voxeliface/contexts/theme';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import * as DropdownMenu from '/voxeliface/components/DropdownMenu';

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
    const changeAccount = id => {
        dispatch(setAccount(id));
        dispatch(saveAccounts());
    };
    const changeTheme = (theme, update) => {
        dispatch(setTheme(theme));
        dispatch(saveSettings());
        update(theme);
    };
    const deleteAccount = ({ profile: { id, name } }) => {
        dispatch(removeAccount(id));
        if (account === id)
            dispatch(setAccount());
        dispatch(saveAccounts());
        toast.success(`Successfully removed ${name}`);
    }
    const addNewAccount = async() => {
        dispatch(setAddingAccount(true));
        try {
            toast('Check your browser, a new tab has opened.');
            const accessCode = await API.Microsoft.getAccessCode(true);
            appWindow.setFocus();
            toast.loading('Your account is being added...\nMake sure to close the browser tab!', {
                duration: 3000
            });

            const accessData = await API.Microsoft.getAccessData(accessCode);
            const xboxData = await API.XboxLive.getAccessData(accessData.token);
            const xstsData = await API.XboxLive.getXSTSData(xboxData.token);
            const minecraftData = await API.Minecraft.getAccessData(xstsData);

            const account = {
                xbox: xboxData,
                xsts: xstsData,
                microsoft: accessData,
                minecraft: minecraftData
            };
            account.profile = await API.Minecraft.getProfile(minecraftData);

            const gameIsOwned = await API.Minecraft.ownsMinecraft(minecraftData);
            if(!gameIsOwned) {
                dispatch(setAddingAccount(false));
                return toast.error('Failed to add your account.\nYou do not own Minecraft Java Edition.\nXbox Game Pass is unsupported.');
            }
            if(accounts.find(a => a.profile.id === account.profile.id)) {
                dispatch(setAddingAccount(false));
                return toast.error(`Failed to add your account.\nYou already have '${account.profile.name} added.'`);
            }
            dispatch(addAccount(account));
            dispatch(saveAccounts());
            toast.success(`Successfully added '${account.profile.name}'`);
        } catch(err) {
            console.error(err);
            toast.error(`Failed to add your account.\n${err.message ?? 'Unknown Reason.'}`);
        }
        dispatch(setAddingAccount(false));
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
                toast('No updates available!', { duration: 5000 });
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
                            <Grid spacing="1rem">
                                <Setting name="general.account">
                                    <Select.Root value={new String(account).toString()} onChange={changeAccount} disabled={accounts.length === 0} defaultValue="undefined">
                                        <Select.Group name={t('app.mdpkm.settings.general.account.category')}>
                                            {accounts.map(({ profile }, key) =>
                                                <Select.Item key={key} value={profile.id}>
                                                    <Image src={`${SKIN_API_BASE}/face/24/${profile.id}`} size={24} borderRadius={4}/>
                                                    {profile.name}
                                                </Select.Item>
                                            )}
                                        </Select.Group>
                                        <Select.Item value="undefined" disabled>
                                            {t('app.mdpkm.settings.general.account.items.none')}
                                        </Select.Item>
                                    </Select.Root>
                                    <Button theme="accent" onClick={addNewAccount} disabled={addingAccount} css={{
                                        width: 'auto'
                                    }}>
                                        {addingAccount ? <BasicSpinner size={16}/> : <PlusLg size={14}/>}
                                        {t('app.mdpkm.settings.general.account.add')}
                                    </Button>
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger asChild>
                                            <Button theme="secondary" css={{
                                                width: 'auto'
                                            }}>
                                                <XLg/>
                                                {t('app.mdpkm.settings.general.account.remove')}
                                            </Button>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content sideOffset={8}>
                                            <DropdownMenu.Label>{t('app.mdpkm.settings.general.account.category')}</DropdownMenu.Label>
                                            {accounts.map(({ profile: { id, name } }, key) =>
                                                <DropdownMenu.Item key={key} onClick={() => deleteAccount(accounts[key])}>
                                                    <Image src={`${SKIN_API_BASE}/face/24/${id}`} size={24} borderRadius={4}/>
                                                    {name}
                                                </DropdownMenu.Item>
                                            )}
                                            <DropdownMenu.Arrow/>
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Root>
                                </Setting>
                                {account && <Grid width="100%" direction="vertical">
                                    <InputLabel>Skin Preview</InputLabel>
                                    <Image src={`${SKIN_API_BASE}/full/256/${account}`} width="100%" height="100%" borderRadius={4} css={{
                                        backgroundPosition: 'left center'
                                    }}/>
                                </Grid>}
                            </Grid>
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
                                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" css={{ gap: 8 }}>
                                                {pluginLoaders.map(({ icon }, key) =>
                                                    <Image key={key} src={icon} size={20} background="$primaryBackground" borderRadius={4}/>
                                                )}
                                                {t(`app.mdpkm.settings.plugins.item.adds_loader${t > 1 ? 's' : ''}`, {
                                                    val: pluginLoaders.length
                                                })}
                                            </Typography>
                                        }
                                        <Button theme="secondary" disabled>
                                            <Trash3Fill/>
                                            Remove
                                        </Button>
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
                            <Button theme="accent" onClick={cleanInstallation} disabled>
                                {t('app.mdpkm.settings.storage.clean')}
                            </Button>
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