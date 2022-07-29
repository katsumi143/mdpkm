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
import { XLg, PlusLg, ThreeDots, BoxArrowUpRight } from 'react-bootstrap-icons';

import Tag from './Tag';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Portal from '/voxeliface/components/Portal';
import Header from '/voxeliface/components/Typography/Header';
import Typography from '/voxeliface/components/Typography';
import InputLabel from '/voxeliface/components/Input/Label';
import * as Select from '/voxeliface/components/Input/Select';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import * as DropdownMenu from '/voxeliface/components/DropdownMenu';

import API from '../common/api';
import Patcher from '/src/common/plugins/patcher';
import { SKIN_API_BASE } from '../common/constants';
import { addAccount, setAccount, saveAccounts, removeAccount, setAddingAccount } from '../common/slices/accounts';
export default Patcher.register(function Settings() {
    const { t } = useTranslation();
    const account = useSelector(state => state.accounts.selected);
    const accounts = useSelector(state => state.accounts.data);
    const dispatch = useDispatch();
    const addingAccount = useSelector(state => state.accounts.addingAccount);
    const [error, setError] = useState();
    const changeAccount = id => {
        dispatch(setAccount(id));
        dispatch(saveAccounts());
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
            const xstsData = await API.XboxLive.getXSTSData(xboxData.token, 'rp://api.minecraftservices.com/');
            const xstsData2 = await API.XboxLive.getXSTSData(xboxData.token);
            const minecraftData = await API.Minecraft.getAccessData(xstsData);
            const gameIsOwned = await API.Minecraft.ownsMinecraft(minecraftData);
            if(!gameIsOwned) {
                dispatch(setAddingAccount(false));
                return setError('NOT_OWNED');
            }

            const account = {
                xbox: xboxData,
                xsts: xstsData,
                xsts2: xstsData2,
                microsoft: accessData,
                minecraft: minecraftData,
                xboxProfile: await API.XboxLive.getProfile(xstsData2)
            };
            account.profile = await API.Minecraft.getProfile(minecraftData);

            if(accounts.find(a => a.profile.id === account.profile.id)) {
                dispatch(setAddingAccount(false));
                return toast.error(`Failed to add your account.\nYou already have '${account.profile.name}' added.`);
            }
            dispatch(addAccount(account));
            dispatch(saveAccounts());
            toast.success(`Successfully added '${account.profile.name}'`);
        } catch(err) {
            console.error(err);
            if (err.includes('Network Error'))
                setError('NETWORK_ERR');
        }
        dispatch(setAddingAccount(false));
    };
    return (
        <Grid height="-webkit-fill-available" padding=".75rem 1rem" direction="vertical" css={{
            overflow: 'auto'
        }}>
            <Header>{t('app.mdpkm.accounts.header')}</Header>
            <Grid spacing={8} padding="0 1rem" direction="vertical">
                <Image src="img/banners/microsoft.svg" width={112} height={24} margin="0 0 8px"/>
                {!account && <Typography size=".8rem" color="$secondaryColor" family="Nunito" whitespace="pre">
                    {t('app.mdpkm.accounts.select_account')}
                </Typography>}
                <Grid spacing={8} direction="vertical">
                    {accounts.map(({ profile, xboxProfile }, key) =>
                        <Grid key={key} width="40%" padding="8px" spacing={8} alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{ position: 'relative' }}>
                            <Image src={xboxProfile?.avatar ?? `${SKIN_API_BASE}/face/24/${profile.id}`} size={32} borderRadius={xboxProfile ? 16 : 4}/>
                            <Typography color="$primaryColor" family="Nunito">
                                {xboxProfile?.gamertag ?? profile.name}
                                <Typography size=".75rem" color="$secondaryColor" family="Nunito Sans" lineheight={1}>
                                    {profile.name}
                                </Typography>
                            </Typography>
                            <Grid spacing={8} alignItems="center" css={{
                                right: 8,
                                position: 'absolute'
                            }}>
                                {account === profile.id ? <Tag>
                                    <Typography size=".7rem" color="$tagColor">
                                        {t('app.mdpkm.accounts.account.active')}
                                    </Typography>
                                </Tag> : <Button theme="accent" onClick={() => changeAccount(profile.id)}>
                                    {t('app.mdpkm.common:actions.select')}
                                </Button>}
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                        <Button theme="secondary" onClick={() => changeAccount(profile.id)}>
                                            <ThreeDots size={17}/>
                                        </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content sideOffset={8}>
                                        <DropdownMenu.Label>{t('app.mdpkm.accounts.account.actions.label')}</DropdownMenu.Label>
                                        <DropdownMenu.Item onClick={() => open('https://minecraft.net/profile')}>
                                            {t('app.mdpkm.accounts.account.actions.manage_profile')}
                                            <BoxArrowUpRight/>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item onClick={() => open(`https://namemc.com/profile/${profile.id}`)}>
                                            {t('app.mdpkm.accounts.account.actions.view_namemc')}
                                            <BoxArrowUpRight/>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item onClick={() => deleteAccount(accounts[key])}>
                                            {t('app.mdpkm.accounts.account.actions.remove')}
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Arrow/>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
                <Button theme="accent" onClick={addNewAccount} disabled={addingAccount}>
                    {addingAccount ? <BasicSpinner size={16}/> : <PlusLg size={14}/>}
                    {t('app.mdpkm.accounts.add')}
                </Button>
            </Grid>
            {error && <Portal>
                <Grid width="100vw" height="100vh" background="#00000099" alignItems="center" justifyContent="center">
                    <Grid width="45%" padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                        border: '1px solid $secondaryBorder2',
                        position: 'relative'
                    }}>
                        <Header>Account Error</Header>
                        {error == 'NOT_OWNED' && <Typography color="$primaryColor">
                            You do not own Minecraft: Java Edition.<br/>
                            <Typography size=".9rem" color="$secondaryColor">
                                Xbox Game Pass is unsupported.
                            </Typography>
                        </Typography>}
                        {error == 'NETWORK_ERR' && <Typography color="$primaryColor">
                            A network error occured.<br/>
                            <Typography size=".9rem" color="$secondaryColor">
                                Check your internet connection, you might be offline.
                            </Typography>
                        </Typography>}
                        <Grid margin="2rem 0 0" spacing={8}>
                            <Button theme="secondary" onClick={() => setError()} >
                                <XLg/>
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Portal>}
        </Grid>
    );
});