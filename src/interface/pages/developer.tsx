import React, { useState } from 'react';

import ImageWrapper from '../components/ImageWrapper';
import { Grid, Button, TextInput, Typography, TextHeader, InputLabel } from '../../../voxeliface/src';

import mdpkm from '../../mdpkm';
import voxura from '../../voxura';
import Patcher from '../../plugins/patcher';
import PluginSystem from '../../plugins';
import { getDefaultIcon } from '../../../voxura/src/util';
import { APP_DIR, APP_NAME, APP_VERSION } from '../../util/constants';
import { useCurrentAccount, useRecentInstances } from '../../voxura';
export default function Developer() {
    const account = useCurrentAccount();
    const [crash, setCrash] = useState<any>(null);
    const [iconTest, setIconTest] = useState('28839');
    return <Grid width="100%" height="inherit" padding=".75rem 1rem" direction="vertical">
        <TextHeader>Developer Stuff</TextHeader>
        <InputLabel>buttons of fun</InputLabel>
        <Grid spacing={8}>
            <Button theme="accent" onClick={() => setCrash({})}>
                <IconBiExclamationTriangleFill/>
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
                <IconBiExclamationTriangleFill/>
                Remove all component patches
            </Button>
        </Grid>

        <InputLabel spaciouser>instance icon tester</InputLabel>
        <Grid spacing={8}>
            <ImageWrapper src={getDefaultIcon(iconTest)} size={32} shadow canPreview/>
            <TextInput
                value={iconTest}
                onChange={setIconTest}
            />
        </Grid>

        <InputLabel spaciouser>current account info</InputLabel>
        <Grid vertical>
            <Typography size={14}>
                name: {account?.name}
            </Typography>
            <Typography size={14}>
                real name: {account?.data.xboxProfile?.realName}
            </Typography>
            <Typography size={14}>
                xbox name: {account?.xboxName}
            </Typography>
            <Typography size={14}>
                minecraft uuid: {account?.uuid}
            </Typography>
        </Grid>

        <InputLabel spaciouser>mdpkm info</InputLabel>
        <Grid vertical>
            <Typography size={14}>
                news sources: {mdpkm.newsSources.map(n => n.id).join(', ')}
            </Typography>
            <Typography size={14}>
                loader entries: {mdpkm.loaderEntries.length}
            </Typography>
        </Grid>

        <InputLabel spaciouser>voxura info</InputLabel>
        <Grid vertical>
            <Typography size={14}>
                loaders: 
            </Typography>
            <Typography size={14}>
                platforms: {Object.keys(voxura.platforms).join(', ')}
            </Typography>
            <Typography size={14}>
                loaded instances: {voxura.instances.getAll().length}
            </Typography>
            <Typography size={14}>
                available accounts: {voxura.auth.accounts.length}
            </Typography>
            <Typography size={14}>
                root path: {voxura.rootPath}
            </Typography>
        </Grid>

        <InputLabel spaciouser>PluginSystem info</InputLabel>
        <Grid vertical>
            <Typography size={14}>
                path: {PluginSystem.path}
            </Typography>
            <Typography size={14}>
                patches: {Object.keys(Patcher.patches).length}
            </Typography>
            <Typography size={14}>
                loaded plugins: {Object.keys(PluginSystem.loaded).length}
            </Typography>
            <Typography size={14}>
                patchable components: {Object.keys(Patcher.registered).length}
            </Typography>
        </Grid>

        <InputLabel spaciouser>LOADER_MAP</InputLabel>
        <Grid vertical>
            {/*LOADER_MAP.map(loader => <Typography size={14}>
                {loader.id} ({loader.name})
            </Typography>)*/}
        </Grid>

        <InputLabel spaciouser>loader entries</InputLabel>
        <Grid vertical>
            {mdpkm.loaderEntries.map(entry => <Typography size={14}>
                {entry.displayName} ({entry.id}) ({entry.category})
            </Typography>)}
        </Grid>

        <InputLabel spaciouser>news sources</InputLabel>
        <Grid vertical>
            {mdpkm.newsSources.map(source => <Typography size={14}>
                {source.displayName} ({source.id})
            </Typography>)}
        </Grid>

        <InputLabel spaciouser>loaded plugins</InputLabel>
        <Grid vertical>
            {Object.values(PluginSystem.loaded).map(plugin => <Typography size={14}>
                {plugin.id} v{plugin.version} (app v{plugin.minAppVersion} minimum)
            </Typography>)}
        </Grid>

        <InputLabel spaciouser>application info</InputLabel>
        <Grid vertical>
            <Typography size={14}>
                APP_NAME: {APP_NAME}
            </Typography>
            <Typography size={14}>
                APP_VERSION: {APP_VERSION}
            </Typography>
            <Typography size={14}>
                APP_DIR: {APP_DIR}
            </Typography>
        </Grid>
    </Grid>;
};