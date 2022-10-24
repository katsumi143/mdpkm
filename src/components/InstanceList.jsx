import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Instance from './Instance';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import Patcher from '/src/common/plugins/patcher';
import { useInstances } from '../voxura';
export default Patcher.register(function InstanceList({ id, onSelect }) {
    const { t } = useTranslation();
    const instances = useInstances();
    const [loading, setLoading] = useState(false);
    const refresh = async() => {
        setLoading(true);
        await manager.refreshInstances();
        setLoading(false);
    };
    console.log(instances);
    return <React.Fragment>
        <Grid width="100%" padding="12px 16px" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={12} alignItems="center">
                <IconBiListUl/>
                <Grid spacing={2} direction="vertical">
                    <Typography size=".9rem" lineheight={1}>
                        {t('app.mdpkm.headers.instances')}
                    </Typography>
                    <Typography size=".7rem" color="$secondaryColor" weight={400} lineheight={1}>
                        {!instances ? 'Loading' : instances.length + ' Installed'}
                    </Typography>
                </Grid>
            </Grid>
            <Button theme="secondary" onClick={refresh} disabled={loading || !instances}>
                {loading ? <BasicSpinner size={16}/> : <IconBiArrowClockwise size={14}/>}
                {t('app.mdpkm.common:actions.refresh')}
            </Button>
        </Grid>
        <Grid height="100%" spacing={8} padding="8px 0" direction="vertical" alignItems="center" css={{
            overflowY: "auto"
        }}>
            {instances ?
                instances.length > 0 ? instances.map((instance, index) => {
                    return <Instance key={index} onView={() => onSelect(instance.id)} instance={instance} css={{
                        animationDelay: `${100 * index}ms`,

                        '& > div': {
                            border: id === instance.id ? '1px solid $secondaryBorder2' : undefined,
                            background: id === instance.id ? '$secondaryBackground2' : undefined
                        }
                    }}/>;
                }) : <Grid margin="1rem 0" direction="vertical" alignItems="center">
                    <Typography size="1.2rem" family="$primaryFontSans">
                        There's nothing here!
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} lineheight={1.3}>
                        You must be new to mdpkm, get started<br/>
                        by clicking "Add New Instance"
                    </Typography>
                </Grid>
            : <Spinner margin="1rem"/>}
        </Grid>
    </React.Fragment>;
});