import React from 'react';

import Instance from '../components/Instance';
import { Grid, Typography, TextHeader } from '../../voxeliface/src';

import { useRecentInstances } from '../voxura';
export default function Home({ setPage }) {
    const recent = useRecentInstances();
    return <Grid width="100%" height="inherit" padding=".75rem 1rem" direction="vertical" css={{
        overflow: 'hidden'
    }}>
        <TextHeader>
            Home
        </TextHeader>
        <Grid height="100%" justifyContent="end" css={{
            overflow: 'hidden'
        }}>
            <Grid width="30%" height="100%" spacing={16} vertical>
                <Grid justifyContent="space-between" css={{
                    borderBottom: '1px solid $secondaryBorder2',
                    paddingBottom: 6
                }}>
                    <Typography>
                        Recent instances
                    </Typography>
                    <Typography size={12} color="$secondaryColor" onClick={() => setPage(1)} css={{
                        cursor: 'pointer'
                    }}>
                        View all
                    </Typography>
                </Grid>
                <Grid height="100%" spacing={8} vertical css={{
                    overflowY: 'auto'
                }}>
                    {recent.map((instance, key) =>
                        <Instance key={key} instance={instance} css={{ padding: 0 }}/>
                    )}
                </Grid>
            </Grid>
        </Grid>
    </Grid>;
};