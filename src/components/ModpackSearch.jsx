import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Modpack from './Modpack';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import * as Select from '/voxeliface/components/Input/Select';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Util from '../common/util';
import { Search } from 'react-bootstrap-icons';
export default function ModpackSearch({ css, loading, setLoading, importModpack }) {
    const { t } = useTranslation();
    const [api, setApi] = useState('modrinth');
    const [query, setQuery] = useState();
    const [modpacks, setModpacks] = useState();
    const [searching, setSearching] = useState(false);
    const search = api => {
        if(searching)
            return toast.error('Already searching');
        if(!API.get(api).Modpacks) {
            setModpacks([]);
            return toast.error(`API.${api}.Modpacks is missing`);
        }
        setSearching(true);
        API.get(api).Modpacks.search(query, {
            
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
                            <Select.Group name="Modpack Platforms">
                                {API.getModpackPlatformIDs().map((platform, index) =>
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
                {modpacks && modpacks.map((modpack, index) =>
                    <Modpack
                        api={api}
                        key={index}
                        data={modpack}
                        loading={loading}
                        setLoading={setLoading}
                        importModpack={importModpack}
                    />
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