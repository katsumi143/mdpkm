import React, { useState } from 'react';
import { ArrowLeft } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import ModpackSearch from './ModpackSearch';
export default function ModpackSetup({ back, install }) {
    const [installState, setInstallState] = useState();
    const installLoader = () => install();
    return (
        <Grid width="100%" direction="vertical" alignItems="center">
            <Grid width="100%" height="-webkit-fill-available" padding="1rem" direction="vertical" alignItems="center" css={{
                overflow: 'auto'
            }}>
                <ModpackSearch css={{
                    width: '100%',
                    height: '100%'
                }}/>
            </Grid>
            <Grid width="100%" padding={16} justifyContent="space-between" css={{
                borderTop: `${installState ? 4 : 1}px solid $tagBorder`,
                transition: 'border 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                borderImage: installState ? `linear-gradient(to right, #73c280 50%, $headerBackground 50%) 100% 1` : null
            }}>
                {installState ?
                    <Typography size="1.1rem" color="$primaryColor" weight={600} family="Nunito">
                        {installState}
                    </Typography>
                :
                    <Button theme="secondary" onClick={back}>
                        <ArrowLeft size={14}/>
                        Back to Selection
                    </Button>
                }
                <Grid spacing={8}>
                    <Button onClick={installLoader} disabled={!name || !!installState}>
                        Install
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};