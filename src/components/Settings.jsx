import React from 'react';
import toast from 'react-hot-toast';
import { appWindow } from '@tauri-apps/api/window';
import { useSelector, useDispatch } from 'react-redux';
import { Gear, PlusLg, ArrowLeft } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Select from '/voxeliface/components/Input/Select';
import Divider from '/voxeliface/components/Divider';
import Typography from '/voxeliface/components/Typography';
import SelectItem from '/voxeliface/components/Input/SelectItem';
import ThemeContext from '/voxeliface/contexts/theme';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import LocalStrings from '../localization/strings';
import { SKIN_API_BASE } from '../common/constants';
import { setTheme, setLanguage, saveSettings } from '../common/slices/settings';
import { addAccount, setAccount, saveAccounts, setAddingAccount } from '../common/slices/accounts';
export default function Settings({ close }) {
    const theme = useSelector(state => state.settings.theme);
    const account = useSelector(state => state.accounts.selected);
    const accounts = useSelector(state => state.accounts.data);
    const dispatch = useDispatch();
    const language = useSelector(state => state.settings.language);
    const addingAccount = useSelector(state => state.accounts.addingAccount);
    const changeLanguage = lang => {
        dispatch(setLanguage(lang));
        dispatch(saveSettings());
        LocalStrings.setLanguage(lang);
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
            account.profile = await API.Minecraft.getProfile(account);

            const gameIsOwned = await API.Minecraft.ownsMinecraft(account);
            if(!gameIsOwned) {
                dispatch(setAddingAccount(false));
                return toast.error('Failed to add your account.\nYou do not own Minecraft Java Edition.\nXbox Game Pass is unsupported.');
            }
            if(accounts.find(a => a.profile.uuid === account.profile.uuid)) {
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
    return (
        <ThemeContext.Consumer>
            {({ setTheme }) => (
                <Grid width="100%" padding="1rem 1.2rem" direction="vertical">
                    <Typography size="1.3rem" color="$primaryColor" family="Nunito" css={{ gap: 8 }}>
                        <Gear/>
                        Settings
                    </Typography>
                    <TextDivider text="General Settings"/>
                    <Grid padding="0 1rem" direction="vertical">
                        <Setting name="general.account">
                            <Select value={account} onChange={({ target }) => changeAccount(target.value)} placeholder="Select an Account">
                                {accounts.map(({ profile }, key) =>
                                    <SelectItem key={key} value={profile.uuid}>
                                        <Image src={`${SKIN_API_BASE}/face/${profile.uuid}`} size={24}/>
                                        {profile.name}
                                    </SelectItem>
                                )}
                            </Select>
                            <Button theme="accent" onClick={addNewAccount} disabled={addingAccount} css={{
                                minWidth: 196
                            }}>
                                {addingAccount ? <BasicSpinner size={16}/> : <PlusLg/>}
                                Add New Account
                            </Button>
                        </Setting>
                        <Setting name="general.theme">
                            <Select value={theme} onChange={({ target }) => changeTheme(target.value, setTheme)}>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="purple">plow's puprle</SelectItem>
                            </Select>
                        </Setting>
                        <Setting name="general.language">
                            <Select value={language} onChange={({ target }) => changeLanguage(target.value)}>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="among">Among Us</SelectItem>
                            </Select>
                        </Setting>
                    </Grid>

                    <TextDivider text="Instance Settings"/>
                    <Grid padding="0 1rem" direction="vertical">
                        <Setting/>
                    </Grid>

                    <TextDivider text="Java Settings"/>
                    <Grid padding="0 1rem" direction="vertical">
                        <Setting/>
                    </Grid>

                    <Button theme="secondary" css={{ left: 16, bottom: 16, position: "fixed" }} onClick={close}>
                        <ArrowLeft/>
                        Back to Instances
                    </Button>
                </Grid>
            )}
        </ThemeContext.Consumer>
    );
};

function Setting({ name, children }) {
    const stringBase = `app.mdpkm.settings.${name ?? 'placeholder'}`;
    return <Grid margin=".6rem 0" justifyContent="space-between">
        <Grid spacing="4px" direction="vertical">
            <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                {LocalStrings[stringBase] ?? stringBase}
            </Typography>
            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1.2} whitespace="pre-wrap" textalign="start">
                {LocalStrings[`${stringBase}.summary`] ?? `${stringBase}.summary`}
            </Typography>
        </Grid>
        <Grid spacing={4} direction="vertical">
            {children}
        </Grid>
    </Grid>
};

function TextDivider({ text }) {
    return <Divider width="100%" margin="2rem 0 1rem" css={{
        '&:after': {
            color: '$secondaryColor',
            content: text,
            padding: '2px 8px',
            fontSize: '.9rem',
            position: 'absolute',
            transform: 'translateY(-50%)',
            fontWeight: 400,
            fontFamily: 'Nunito',
            background: '$primaryBackground'
        }
    }}/>
};