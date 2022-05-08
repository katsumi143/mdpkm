import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Mod from './Mod';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Select from '/voxeliface/components/Input/Select';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import SelectItem from '/voxeliface/components/Input/SelectItem';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Instances from '../common/instances';
import { APINames, ModPlatforms, PlatformNames, PlatformIcons } from '../common/constants';
import { Search } from 'react-bootstrap-icons';
export default function ModSearch({ instance }) {
    const { config } = Instances.instances[instance];

    const [api, setApi] = useState('Modrinth');
    const [mods, setMods] = useState();
    const [query, setQuery] = useState();
    const [instance2, setInstance2] = useState();
    const [searching, setSearching] = useState(false);
    const search = api => {
        if(searching)
            return toast.error('Already searching');
        if(!API[api].Mods) {
            setMods([]);
            return toast.error(`API.${api}.Mods is missing`);
        }
        setSearching(true);
        API[api].Mods.search(query, {
            versions: [config.loader.game],
            categories: [config.loader.type]
        }).then(({ hits }) => {
            setMods(hits);
            setSearching(false);
        }).catch(err => {
            setMods([]);
            setSearching(false);
            toast.error(`Mod Search failed!\n${err.message ?? 'Unknown Reason.'}`);
        });
    };
    const setAPI = api => {
        setApi(api);
        search(api);
    };
    useEffect(() => {
        if(instance !== instance2) {
            setMods();
            setSearching(false);
        }
        setInstance2(instance);
    }, [instance]);
    useEffect(() => {
        if(!mods && !searching)
            search(api);
    }, [mods]);
    return (
        <Grid spacing="1rem" direction="vertical">
            <Grid justifyContent="space-between">
                <Grid>
                    <Grid spacing="4px" direction="vertical">
                        <Typography size=".9rem" text="Search Query" color="$secondaryColor" family="Nunito"/>
                        <TextInput value={query} onChange={event => setQuery(event.target.value)}>
                            <Button theme="secondary" onClick={() => search(api)} disabled={searching}>
                                {searching ? <BasicSpinner size={16}/> : <Search/>}
                                Search
                            </Button>
                        </TextInput>
                    </Grid>
                </Grid>
                <Grid>
                    <Grid spacing="4px" direction="vertical">
                        <Typography size=".9rem" text="Mod Platform" color="$secondaryColor" family="Nunito"/>
                        <Select value={api} onChange={event => setAPI(event.target.value)}>
                            {ModPlatforms.map((platform, index) =>
                                <SelectItem key={index} value={APINames[platform]}>
                                    <Image src={PlatformIcons[platform]} size={16} borderRadius={4}/>
                                    {PlatformNames[platform]}
                                </SelectItem>
                            )}
                        </Select>
                    </Grid>
                </Grid>
            </Grid>
            <Grid spacing="8px" direction="vertical">
                {mods && mods.map((mod, index) =>
                    <Mod key={index} data={mod} instance={instance}/>
                )}
                <Grid direction="vertical">
                    <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                        There's nothing here!
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        Try searching again, or wait a few seconds!
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    );
};