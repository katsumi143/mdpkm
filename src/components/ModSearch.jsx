import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Mod from './Mod';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import * as Select from '/voxeliface/components/Input/Select';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Util from '../common/util';
import { Search } from 'react-bootstrap-icons';
export default function ModSearch({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const { config } = instance;
    const loaderData = API.getLoader(config?.loader?.type);

    const [api, setApi] = useState('modrinth');
    const [mods, setMods] = useState();
    const [query, setQuery] = useState('');
    const [instance2, setInstance2] = useState();
    const [searching, setSearching] = useState(false);
    const search = api => {
        if(searching)
            return toast.error('Already searching');
        if(!API.get(api).Mods) {
            setMods([]);
            return toast.error(`API.${api}.Mods is missing`);
        }
        setSearching(true);
        API.get(api).Mods.search(query, {
            versions: [config.loader.game, config.loader.game.substring(0, Math.max(4, config.loader.game.lastIndexOf('.')))],
            categories: [...[loaderData?.asLoader ?? config.loader.type]]
        }).then(({ hits }) => {
            setMods(hits);
            setSearching(false);
        }).catch(err => {
            setMods([]);
            setSearching(false);
            console.error(err);
            toast.error(`Mod Search failed!\n${err.message ?? 'Unknown Reason.'}`);
        });
    };
    const setAPI = api => {
        setApi(api);
        search(api);
    };
    useEffect(() => {
        if(instanceId !== instance2) {
            setMods();
            setSearching(false);
        }
        setInstance2(instanceId);
    }, [instance]);
    useEffect(() => {
        if(!mods && !searching)
            search(api);
    }, [mods]);
    return (
        <Grid spacing="1rem" direction="vertical">
            <Grid justifyContent="space-between">
                <Grid>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            {t('app.mdpkm.common:labels.search_query')}
                        </Typography>
                        <TextInput value={query} onChange={setQuery}>
                            <Button theme="secondary" onClick={() => search(api)} disabled={searching}>
                                {searching ? <BasicSpinner size={16}/> : <Search/>}
                                {t('app.mdpkm.common:actions.search')}
                            </Button>
                        </TextInput>
                    </Grid>
                </Grid>
                <Grid>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            {t('app.mdpkm.common:labels.platform')}
                        </Typography>
                        <Select.Root value={api} onChange={setAPI} disabled={searching}>
                            <Select.Group name="Mod Platforms">
                                {API.getModPlatformIDs().map((platform, index) =>
                                    <Select.Item key={index} value={platform}>
                                        <Image src={API.get(platform).icon} size={16} borderRadius={4}/>
                                        {Util.getPlatformName(platform)}
                                    </Select.Item>
                                )}
                            </Select.Group>
                        </Select.Root>
                        {API.get(api)?.announcement && <Typography size=".6rem" color="$secondaryColor" family="Nunito" whitespace="nowrap">
                            {API.get(api).announcement}
                        </Typography>}
                    </Grid>
                </Grid>
            </Grid>
            <Grid spacing={8} direction="vertical">
                {mods && mods.map((mod, index) =>
                    <Mod key={index} data={mod} instanceId={instanceId}/>
                )}
                <Grid direction="vertical">
                    <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                        {t('app.mdpkm.common:headers.empty_list')}
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        Try searching again, or wait a few seconds!
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    );
};