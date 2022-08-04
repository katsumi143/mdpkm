import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Archive, ArrowClockwise } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Instance from './Instance';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import Patcher from '/src/common/plugins/patcher';
import Instances from '../common/instances';
export default Patcher.register(function InstanceList({ id, onSelect }) {
    const { t } = useTranslation();
    const state = useSelector(state => state.instances.state);
    const instances = useSelector(state => state.instances.data);
    const [loading, setLoading] = useState(false);
    const refresh = async() => {
        setLoading(true);
        await Instances.getInstances();
        setLoading(false);
    };
    return <React.Fragment>
        <Grid width="100%" padding="12px 16px" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={4} direction="vertical">
                <Typography color="$primaryColor" weight={600} family="Nunito" spacing={12} horizontal lineheight={1}>
                    <Archive size={20}/>
                    {t('app.mdpkm.headers.instances')}
                    <Typography size=".6rem" color="$secondaryColor" weight={300} family="Nunito" margin="2px 0 0 -6px" lineheight={1}>
                        ({Instances.gettingInstances || !instances ? "Loading" : instances.length})
                    </Typography>
                </Typography>
                {typeof state === "string" &&
                    <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        {state}
                    </Typography>
                }
            </Grid>
            <Button theme="secondary" onClick={refresh} disabled={loading || Instances.gettingInstances || !instances}>
                {loading ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                {t('app.mdpkm.common:actions.refresh')}
            </Button>
        </Grid>
        <Grid height="100%" spacing={8} padding="8px 0" direction="vertical" alignItems="center" css={{
            overflowY: "auto"
        }}>
            {instances && !Instances.gettingInstances ?
                instances.length > 0 ? instances.map((instance, index) => {
                    return <Instance key={index} data={instance} onView={() => onSelect(instance.id)} css={{
                        animationDelay: `${100 * index}ms`,

                        '& > div': {
                            border: id === instance.id ? '1px solid $secondaryBorder2' : undefined,
                            background: id === instance.id ? '$secondaryBackground2' : undefined
                        }
                    }}/>;
                }) : <Grid margin="1rem 0" direction="vertical" alignItems="center">
                    <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                        There's nothing here!
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1.3}>
                        You must be new to mdpkm, get started<br/>
                        by clicking "Add New Instance"
                    </Typography>
                </Grid>
            : <Spinner margin="1rem"/>}
        </Grid>
    </React.Fragment>;
});