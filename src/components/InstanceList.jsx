import React, { useState } from 'react';
import { Archive } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Instance from './Instance';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import Instances from '../common/instances';
export default function InstanceList({ selected, onSelect, instances }) {
    const [loading, setLoading] = useState(false);
    const refresh = async() => {
        setLoading(true);
        Instances.instances = [];
        Instances.emit('changed');
        
        await Instances.getInstances();
        Instances.emit('changed');
        setLoading(false);
    };
    return <React.Fragment>
        <Grid width="100%" padding=".8rem 1.2rem" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={4} direction="vertical">
                <Typography color="$primaryColor" weight={600} family="Nunito" lineheight={1}>
                    <Archive size={20} style={{ marginRight: 12 }}/>
                    Your Instances
                    <Typography size=".6rem" color="$gray11" weight={300} family="Nunito" margin="2px 0 0 8px" lineheight={1}>
                        ({Instances.gettingInstances || !instances ? "Loading" : instances.length})
                    </Typography>
                </Typography>
                {typeof Instances.state === "string" &&
                    <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        {Instances.state}
                    </Typography>
                }
            </Grid>
            <Button theme="secondary" onClick={refresh} disabled={loading || Instances.gettingInstances || !instances}>
                {loading && <BasicSpinner size={16}/>}
                Refresh
            </Button>
        </Grid>
        <Grid height="100%" margin="8px 0 0" spacing="8px" direction="vertical" alignItems="center" css={{
            overflowY: "auto"
        }}>
            {instances && !Instances.gettingInstances ? instances.map((instance, index) => {
                return <Instance key={index} data={instance} onView={() => onSelect(index)} css={{
                    animationDelay: `${100 * index}ms`,

                    '& > div': {
                        border: selected === index ? '1px solid $secondaryBorder2' : undefined,
                        background: selected === index ? '$secondaryBackground2' : undefined
                    }
                }}/>;
            }) : <Spinner margin="1rem"/>}
        </Grid>
    </React.Fragment>;
};