import React, { useState, useEffect } from 'react';
import { open } from '@tauri-apps/api/shell';
import { BoxArrowUpRight } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Typography from '/voxeliface/components/Typography';

import API from '../common/api';
import { PlatformIndex, PlatformNames } from '../common/constants';
export default function Modpack({ id, api, data, featured, recommended }) {
    const [modpack, setModpack] = useState(data);
    const installModpack = () => null;
    useEffect(() => {
        if(id && typeof api === 'number' && !modpack)
            API[PlatformNames[PlatformIndex[api]]].getProject(id).then(setModpack);
    }, [id, api]);
    useEffect(() => {
        if(data && data !== modpack)
            setModpack(data);
    }, [data]);
    return (
        <Grid padding="8px" background="$secondaryBackground2" borderRadius={8} css={{ position: 'relative' }}>
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
                <Grid margin="4px 0 0 12px" padding="2px 0" spacing="2px" direction="vertical">
                    <Typography size="1.1rem" color="$primaryColor" family="Nunito" lineheight={1}>
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
                    <Typography size=".9rem" color="$secondaryColor" family="Nunito" textalign="left">
                        {modpack.summary}
                    </Typography>
                </Grid>
                <Grid spacing="8px" css={{
                    right: 8,
                    position: 'absolute'
                }}>
                    {typeof modpack.downloads === 'number' &&
                        <Typography color="$primaryColor" margin="0 8px 0 0" family="Nunito">
                            {Intl.NumberFormat('en-us', {}).format(modpack.downloads)}
                            <Typography size=".8rem" text="Downloads" color="$secondaryColor" family="Nunito" margin="0 0 0 4px"/>
                        </Typography>
                    }
                    {modpack.website_url &&
                        <Button theme="secondary" onClick={() => open(modpack.website_url)}>
                            <BoxArrowUpRight/>
                            Visit Website
                        </Button>
                    }
                </Grid>
            </React.Fragment> : <Spinner/>}
        </Grid>
    );
};