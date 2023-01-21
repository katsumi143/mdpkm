import { useTranslation } from 'react-i18next';
import React, { useRef, useState } from 'react';
import { Grid, Button, Typography, BasicSpinner } from 'voxeliface';

import voxura from '../../voxura';
import { toast } from '../../util';
import InstanceItem from './Instance';
import LoadingInstances from './LoadingInstances';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentInstance } from '../../store/slices/interface';
import { InstanceState, Instance } from '../../../voxura';

export interface InstanceListProps {
    id: string
	items: Instance[]
}
export default function InstanceList({ id, items }: InstanceListProps) {
    const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const container = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const refresh = () => {
		if (voxura.instances.getAll().some(i => i.state !== InstanceState.None))
			return toast('instance_refresh_none_idle');
		dispatch(setCurrentInstance(''));
        setLoading(true);
		container.current?.scrollTo(0, 0);
        voxura.instances.refreshInstances().then(() => setLoading(false));
    };
    return <React.Fragment>
        <Grid width="100%" padding="12px 16px" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={1} vertical>
                <Typography size={14} noSelect lineheight={1}>
                    {t('instance_list')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400} noSelect lineheight={1}>
                    {loading ? t('common.label.loading') : t('common.label.items', { count: items.length })}
                </Typography>
            </Grid>
            <Button theme="secondary" onClick={refresh} disabled={loading || voxura.instances.loading}>
                {loading ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                {t('common.action.refresh')}
            </Button>
        </Grid>
        <Grid ref={container} height="100%" spacing={8} padding="8px 8px" vertical css={{
			position: 'relative',
            overflow: voxura.instances.loading ? 'hidden' : 'hidden auto'
        }}>
            {Object.entries(items.reduce((acc: Record<string, Instance[]>, val) => {
				const { category } = val.store;
				if (!acc[category])
					acc[category] = [];

				acc[category].push(val);
				return acc;
			}, {})).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).map(([category, items]) => {
				return <React.Fragment key={category}>
					<Typography size={14} color="$secondaryColor" weight={400} margin="8px 8px 4px" family="$secondary" noSelect lineheight={1}>
						{category}
					</Typography>
					{items.map(instance =>
						<InstanceItem id={instance.id} key={instance.id} selected={id === instance.id}/>
					)}
				</React.Fragment>;
			})}
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