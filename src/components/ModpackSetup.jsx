import React, { useState } from 'react';
import { ArrowLeft } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import ModpackSearch from './ModpackSearch';
export default function ModpackSetup({ back, importModpack }) {
    return (
        <Grid width="100%" direction="vertical" alignItems="center">
            <Grid width="100%" padding="1rem 0" spacing={8} direction="vertical" alignItems="center" css={{
                borderBottom: '1px solid $tagBorder'
            }}>
                <Typography size="1.2rem" color="$primaryColor" family="Raleway" lineheight={1}>
                    Adding New Instance
                </Typography>
                <Typography size=".9rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                    Select Modpack
                </Typography>
            </Grid>
            <Grid width="100%" height="-webkit-fill-available" padding="1rem" direction="vertical" alignItems="center" css={{
                overflow: 'auto'
            }}>
                <ModpackSearch css={{
                    width: '100%',
                    height: '100%'
                }} importModpack={importModpack}/>
            </Grid>
            <Grid width="100%" padding={16} justifyContent="space-between" css={{
                borderTop: '1px solid $tagBorder'
            }}>
                <Button theme="secondary" onClick={back}>
                    <ArrowLeft size={14}/>
                    Back to Selection
                </Button>
            </Grid>
        </Grid>
    );
};