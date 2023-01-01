import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Grid, Button, Typography, BasicSpinner } from 'voxeliface';

import Instance from './Instance';
import { toast } from '../../util';
import LoadingInstances from './LoadingInstances';
import voxura, { useInstances } from '../../voxura';
import { InstanceState, Instance as VoxuraInstance } from '../../../voxura';

export interface InstanceListProps {
    id: string
}
export default function InstanceList({ id }: InstanceListProps) {
    const { t } = useTranslation('interface');
    const instances = useInstances();
    const [loading, setLoading] = useState(false);
    const refresh = () => {
		if (voxura.instances.getAll().some(i => i.state !== InstanceState.None))
			return toast('instance_refresh_none_idle');
        setLoading(true);
        voxura.instances.refreshInstances().then(() => setLoading(false));
    };
    return <React.Fragment>
        <Grid width="100%" padding="12px 16px" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={1} vertical>
                <Typography size={14} noSelect lineheight={1}>
                    {t('common.header.instance_list')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400} noSelect lineheight={1}>
                    {loading ? t('common.label.loading') : t('common.label.items', { count: instances.length })}
                </Typography>
            </Grid>
            <Button theme="secondary" onClick={refresh} disabled={loading || voxura.instances.loading}>
                {loading ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                {t('common.action.refresh')}
            </Button>
        </Grid>
        <Grid height="100%" spacing={8} padding="8px 8px" vertical css={{
			position: 'relative',
            overflow: voxura.instances.loading ? 'hidden' : 'hidden auto'
        }}>
            {instances.length > 0 ? Object.entries(instances.reduce((acc: Record<string, VoxuraInstance[]>, val) => {
				const { category } = val.store;
				if (!acc[category])
					acc[category] = [];

				acc[category].push(val);
				return acc;
			}, {})).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).map(([category, instances]) => {
				return <React.Fragment key={category}>
					<Typography size={14} color="$secondaryColor" weight={400} margin="8px 8px 4px" family="$secondary" noSelect lineheight={1}>
						{category}
					</Typography>
					{instances.map(instance =>
						<Instance id={instance.id} key={instance.id} selected={id === instance.id}/>
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
			</Grid>}
			{voxura.instances.loading && <Grid width="100%" height="100%" padding={64} background="#00000066" css={{
				top: 0,
				left: 0,
				position: 'absolute'
			}}>
				<LoadingInstances/>
			</Grid>}
        </Grid>
    </React.Fragment>;
}