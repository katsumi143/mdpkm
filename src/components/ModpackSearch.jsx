import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Select from '/voxeliface/components/Input/Select';
import Modpack from './Modpack';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import SelectItem from '/voxeliface/components/Input/SelectItem';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import { APINames, ModPlatforms, PlatformNames, PlatformIcons } from '../common/constants';
import { Search } from 'react-bootstrap-icons';
export default function ModpackSearch({ css }) {
    const [api, setApi] = useState('CurseForge');
    const [query, setQuery] = useState();
    const [modpacks, setModpacks] = useState();
    const [searching, setSearching] = useState(false);
    const search = api => {
        if(searching)
            return toast.error('Already searching');
        if(!API[api].Modpacks) {
            setModpacks([]);
            return toast.error(`API.${api}.Modpacks is missing`);
        }
        setSearching(true);
        API[api].Modpacks.search(query, {
            
        }).then(({ hits }) => {
            setModpacks(hits);
            setSearching(false);
        }).catch(err => {
            setModpacks([]);
            setSearching(false);
            console.error(err);
            toast.error(`Modpack Search failed!\n${err.message ?? 'Unknown Reason.'}`);
        });
    };
    const setAPI = api => {
        setApi(api);
        search(api);
    };
    useEffect(() => {
        if(!modpacks && !searching)
            search(api);
    }, [modpacks]);
    return (
        <Grid spacing="1rem" direction="vertical" css={css}>
            <Grid justifyContent="space-between">
                <Grid>
                    <Grid spacing={4} direction="vertical">
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
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" text="Platform" color="$secondaryColor" family="Nunito"/>
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
            <Grid spacing={8} direction="vertical">
                {modpacks && modpacks.map((modpack, index) =>
                    <Modpack key={index} data={modpack}/>
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