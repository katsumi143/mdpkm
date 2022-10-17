import { open } from '@tauri-apps/api/shell';
import React, { useState, useEffect } from 'react';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Util from '../common/util';
import Patcher from '/src/common/plugins/patcher';
export default Patcher.register(function Modpack({ id, api, data, loading, featured, setLoading, recommended, importModpack }) {
    const [modpack, setModpack] = useState(data);
    const installModpack = async() => {
        setLoading(true);
        const path = await API.get(api).downloadModpack(id ?? data.id);
        const manifest = await API.get(api).readModpackManifest(path);
        await Util.writeBinaryFile(`${Util.tempPath}/${manifest.name}.png`, await API.makeRequest(
            (await API.get(api).getProject(id ?? data.id)).icon,
            { responseType: 'Binary' }
        ));

        setLoading(false);
        importModpack(path);
    };
    useEffect(() => {
        if(id && typeof api === 'string' && !modpack)
            API.get(api).getProject(id).then(setModpack);
    }, [id, api]);
    useEffect(() => {
        if(data && data !== modpack)
            setModpack(data);
    }, [data]);
    return (
        <Grid padding={8} background="$secondaryBackground2" borderRadius={8} css={{ position: 'relative' }}>
            {modpack ? <React.Fragment>
                <Image src={modpack.icon} size={48} borderRadius={4} css={{
                    zIndex: 2,
                    minWidth: 48,
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                    '&:hover': {
                        zIndex: 3,
                        transform: 'scale(2)',
                        transformOrigin: 'top left',
                        backgroundColor: '$primaryBackground'
                    }
                }}/>
                <Grid margin="4px 0 0 12px" padding="2px 0" spacing={2} direction="vertical">
                    <Typography size="1.1rem" horizontal lineheight={1} css={{
                        width: 'fit-content'
                    }}>
                        {modpack.title}
                        {modpack.author && 
                            <Typography size=".7rem" color="$secondaryColor" margin="4px 0 0 4px" lineheight={1}>
                                by {modpack.author}
                            </Typography>
                        }
                        {featured &&
                            <Typography size=".8rem" color="#cbc365" margin="2px 0 0 6px" lineheight={1}>
                                Featured
                            </Typography>
                        }
                        {recommended &&
                            <Typography size=".8rem" color="$secondaryColor" margin="2px 0 0 6px" lineheight={1}>
                                Recommended
                            </Typography>
                        }
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" textalign="left">
                        {modpack.summary}
                    </Typography>
                </Grid>
                <Grid spacing={8} css={{
                    right: 8,
                    position: 'absolute'
                }}>
                    {typeof modpack.downloads === 'number' &&
                        <Typography margin="0 8px 0 0" horizontal>
                            {Intl.NumberFormat('en-us', {}).format(modpack.downloads)}
                            <Typography size=".8rem" text="Downloads" color="$secondaryColor" margin="0 0 0 4px"/>
                        </Typography>
                    }
                    {modpack.website_url &&
                        <Button theme="secondary" onClick={() => open(modpack.website_url)}>
                            <IconBiBoxArrowUpRight/>
                            Visit Website
                        </Button>
                    }
                    <Button onClick={installModpack} disabled={loading || modpack.client_side === "unsupported"}>
                        {loading ? <BasicSpinner size={16}/> : <IconBiDownload/>}
                        Install
                    </Button>
                </Grid>
            </React.Fragment> : <Spinner/>}
        </Grid>
    );
});