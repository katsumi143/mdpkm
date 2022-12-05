import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Grid from '../../../voxeliface/components/Grid';
import Button from '../../../voxeliface/components/Button';
import Spinner from '../../../voxeliface/components/Spinner';
import Instance from './Instance';
import Typography from '../../../voxeliface/components/Typography';
import BasicSpinner from '../../../voxeliface/components/BasicSpinner';

import Voxura, { Instance as VoxuraInstance, useInstances } from '../../voxura';

type InstanceListProps = {
    id: string
};
export default function InstanceList({ id }: InstanceListProps) {
    const { t } = useTranslation();
    const instances = useInstances();
    const [loading, setLoading] = useState(false);
    const refresh = async() => {
        setLoading(true);
        await Voxura.instances.refreshInstances();
        setLoading(false);
    };
    return <React.Fragment>
        <Grid width="100%" padding="12px 16px" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={1} vertical>
                <Typography size={14} lineheight={1}>
                    {t('interface:common.header.instance_list')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400} lineheight={1}>
                    {!instances ? 'Loading' : instances.length + ' Installed'}
                </Typography>
            </Grid>
            <Button theme="secondary" onClick={refresh} disabled={loading || !instances}>
                {loading ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                {t('app.mdpkm.common:actions.refresh')}
            </Button>
        </Grid>
        <Grid height="100%" spacing={8} padding="8px 0" vertical css={{
            overflow: 'hidden auto'
        }}>
            {instances ?
                instances.length > 0 ? Object.entries(instances.reduce((acc: Record<string, VoxuraInstance[]>, val) => {
					const { category } = val.store;
					if (!acc[category])
						acc[category] = [];

					acc[category].push(val);
					return acc;
				}, {})).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).map(([category, instances], key) => {
                    return <React.Fragment key={key}>
						<Typography size={14} color="$secondaryColor" weight={400} margin="4px 16px" family="$secondary" lineheight={1}>
							{category}
						</Typography>
						{instances.map((instance, key) =>
							<Instance key={key} instance={instance} selected={id === instance.id} css={{
								animationDelay: `${100 * key}ms`
							}}/>
						)}
					</React.Fragment>;
                }) : <Grid margin="1rem 0" vertical alignItems="center">
                    <Typography size={18} family="$primarySans">
                        There's nothing here!
                    </Typography>
                    <Typography color="$secondaryColor" weight={400} lineheight={1.3}>
                        You must be new to mdpkm, get started<br/>
                        by clicking "Add New Instance"
                    </Typography>
                </Grid>
            : <Spinner margin={16}/>}
        </Grid>
    </React.Fragment>;
};