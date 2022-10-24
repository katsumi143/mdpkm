import { open } from '@tauri-apps/api/shell';
import { appWindow } from '@tauri-apps/api/window';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Tag from '../components/Tag';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Portal from '/voxeliface/components/Portal';
import Header from '/voxeliface/components/Typography/Header';
import Typography from '/voxeliface/components/Typography';
import ImagePreview from '../components/ImagePreview';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import * as DropdownMenu from '/voxeliface/components/DropdownMenu';

import API from '../common/api';
import { toast } from '../util';
import voxura, { AvatarType, useAccounts, useCurrentAccount } from '../voxura';
export default function Accounts() {
    const { t } = useTranslation();
    const current = useCurrentAccount();
    const accounts = useAccounts();
    const addingAccount = useSelector(state => state.accounts.addingAccount);
    const [error, setError] = useState();
    const changeAccount = account => voxura.auth.selectAccount(account);
    const deleteAccount = async account => {
        await account.remove();
        toast(`Account removed`, `${account.name} has been removed.`);
    }
    const addNewAccount = async() => {
        try {
            toast('Check your browser', 'A new tab has opened in your default browser.');
            const accessCode = await API.Microsoft.getAccessCode(true);
            appWindow.setFocus();
            toast('Adding account', 'Make sure to close the browser tab!');

            const account = await voxura.auth.login(accessCode);
            toast('Account added', `${account.name} has been added.`);
        } catch(err) {
            console.error(err);
            if (err.includes('Network Error'))
                setError('NETWORK_ERR');
        }
    };
    return (
        <Grid height="-webkit-fill-available" padding=".75rem 1rem" direction="vertical" css={{
            overflow: 'auto'
        }}>
            <Header>{t('app.mdpkm.accounts.header')}</Header>
            <Grid spacing={8} padding="0 1rem" direction="vertical">
                <Image src="img/banners/microsoft.svg" width={112} height={24} margin="0 0 8px"/>
                {!current && <Typography size=".8rem" color="$secondaryColor" whitespace="pre">
                    {t('app.mdpkm.accounts.select_account')}
                </Typography>}
                <Grid spacing={8} direction="vertical">
                    {accounts.map((account, key) =>
                        <Account key={key} account={account} current={current} changeAccount={changeAccount} deleteAccount={deleteAccount}/>
                    )}
                </Grid>
                <Button theme="accent" onClick={addNewAccount} disabled={addingAccount}>
                    {addingAccount ? <BasicSpinner size={16}/> : <IconBiPlusLg size={14}/>}
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
                        {error == 'NOT_OWNED' && <Typography>
                            You do not own Minecraft: Java Edition.<br/>
                            <Typography size=".9rem" color="$secondaryColor">
                                Xbox Game Pass is unsupported.
                            </Typography>
                        </Typography>}
                        {error == 'NETWORK_ERR' && <Typography>
                            A network error occured.<br/>
                            <Typography size=".9rem" color="$secondaryColor">
                                Check your internet connection, you might be offline.
                            </Typography>
                        </Typography>}
                        <Grid margin="2rem 0 0" spacing={8}>
                            <Button theme="secondary" onClick={() => setError()} >
                                <IconBiXLg/>
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Portal>}
        </Grid>
    );
};

function Account({ account, current, changeAccount, deleteAccount }) {
    const { t } = useTranslation();
    const avatarUrl = account.getAvatarUrl(AvatarType.Xbox);
    const [previewAvatar, setPreviewAvatar] = useState(false);
    return <Grid width="40%" padding={8} spacing={8} alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{ position: 'relative' }}>
        <Image src={avatarUrl} size={32} onClick={() => setPreviewAvatar(true)} borderRadius={16} css={{
            cursor: 'zoom-in'
        }}/>
        {previewAvatar && <ImagePreview src={avatarUrl} size={192} onClose={() => setPreviewAvatar(false)}/>}
        <Typography>
            {account.xboxName}
            <Typography size=".75rem" color="$secondaryColor" family="$primaryFontSans" lineheight={1}>
                {account.name}
            </Typography>
        </Typography>
        <Grid spacing={8} alignItems="center" css={{
            right: 8,
            position: 'absolute'
        }}>
            {account === current ? <Tag>
                <Typography size=".7rem" color="$tagColor">
                    {t('app.mdpkm.accounts.account.active')}
                </Typography>
            </Tag> : <Button theme="accent" onClick={() => changeAccount(account)}>
                {t('app.mdpkm.common:actions.select')}
            </Button>}
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <Button theme="secondary">
                        <IconBiThreeDots size={17}/>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content sideOffset={8}>
                    <DropdownMenu.Label>{t('app.mdpkm.accounts.account.actions.label')}</DropdownMenu.Label>
                    <DropdownMenu.Item onClick={() => open('https://minecraft.net/profile')}>
                        {t('app.mdpkm.accounts.account.actions.manage_profile')}
                        <IconBiBoxArrowUpRight/>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => open(`https://namemc.com/profile/${profile.id}`)}>
                        {t('app.mdpkm.accounts.account.actions.view_namemc')}
                        <IconBiBoxArrowUpRight/>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => deleteAccount(account)}>
                        {t('app.mdpkm.accounts.account.actions.remove')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow/>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Grid>
    </Grid>;
}