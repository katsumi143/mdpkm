import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Grid, Button, Typography, BasicSpinner } from 'voxeliface';

import Instance from './Instance';
import LoadingInstances from './LoadingInstances';
import voxura, { Instance as VoxuraInstance, useInstances } from '../../voxura';

export type InstanceListProps = {
    id: string
};
export default function InstanceList({ id }: InstanceListProps) {
    const { t } = useTranslation('interface');
    const instances = useInstances();
    const [loading, setLoading] = useState(false);
    const refresh = async() => {
        setLoading(true);
        await voxura.instances.refreshInstances();
        setLoading(false);
    };
    return <React.Fragment>
        <Grid width="100%" padding="12px 16px" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={1} vertical>
                <Typography size={14} lineheight={1}>
                    {t('common.header.instance_list')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400} lineheight={1}>
                    {!instances ? 'Loading' : instances.length + ' Installed'}
                </Typography>
            </Grid>
            <Button theme="secondary" onClick={refresh} disabled={loading || voxura.instances.loading}>
                {loading ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                {t('common.action.refresh')}
            </Button>
        </Grid>
        <Grid height="100%" spacing={8} padding="8px 0" vertical css={{
			position: 'relative',
            overflow: voxura.instances.loading ? 'hidden' : 'hidden auto'
        }}>
            {instances.length > 0 ? Object.entries(instances.reduce((acc: Record<string, VoxuraInstance[]>, val) => {
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
};