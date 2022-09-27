import { open } from '@tauri-apps/api/shell';
import React, { useState, useEffect } from 'react';

import Tag from './Tag';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Typography from '/voxeliface/components/Typography';

import API from '../common/api';
import Util from '../common/util';

export default function News({ render, backButton }) {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if(!data) {
            setLoading(true);
            API.Minecraft.getNews().then(data => {
                setData(data);
                setLoading(false);
            });
        }
    }, [data]);
    return (
        <Grid width="100%" direction="vertical" alignItems="center">
            {data && !loading ? <React.Fragment>
                <Grid width="100%" padding="1rem 0" spacing={4} direction="vertical" alignItems="center" css={{
                    borderBottom: '1px solid $tagBorder'
                }}>
                    <Typography size="1.4rem" color="$primaryColor" family="Raleway">
                        Minecraft News
                    </Typography>
                    <Typography color="$secondaryColor" family="Nunito">
                        {data.description}
                    </Typography>
                </Grid>
                <Grid width="100%" spacing={16} padding="1rem 0" alignItems="center" direction="vertical" css={{ overflow: 'auto' }}>
                    {data.news.map(({ link, title, pubDate, imageURL, primaryTag, description }, key) =>
                        <Grid key={key} width="80%" padding={8} spacing="1rem" alignItems="center" background="$secondaryBackground" borderRadius={8} css={{ position: 'relative' }}>
                            <Image src={`https://minecraft.net${imageURL}`} size={64} borderRadius={4}/>
                            <Grid spacing={4} direction="vertical">
                                <Typography size="1.2rem" color="$primaryColor" weight={600} family="Nunito" lineheight={1} css={{ gap: 8 }}>
                                    {title}
                                    <Tag>
                                        <Typography size=".6rem" color="$tagColor" family="Nunito">
                                            {primaryTag}
                                        </Typography>
                                    </Tag>
                                </Typography>
                                <Typography size=".95rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                                    {description}
                                </Typography>
                            </Grid>
                            <Grid spacing={8} css={{
                                right: 16,
                                position: 'absolute'
                            }}>
                                <Grid margin="0 8px" spacing={4} direction="vertical" alignItems="end">
                                    <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                        Published
                                    </Typography>
                                    <Typography size=".7rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                                        {Util.formatDateBetween(new Date(pubDate), new Date(), 'x-ymhs-ago')}
                                    </Typography>
                                </Grid>
                                <Button theme="secondary" onClick={() => open(link)}>
                                    <BoxArrowUpRight/>
                                    View Article
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </React.Fragment> : <Spinner/>}
            <Grid width="100%" padding={16} css={{
                borderTop: '1px solid $tagBorder'
            }}>
                {backButton}
            </Grid>
        </Grid>
    );
};