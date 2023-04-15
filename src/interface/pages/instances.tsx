import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Grid, Link, Button, Typography, BasicSpinner } from 'voxeliface';

import InstanceList from '../components/InstanceList';
import InstancePage from '../components/InstancePage';

import { setPage } from '../../store/slices/interface';
import voxura, { useInstances } from '../../voxura';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
export default function Instances() {
	const items = useInstances();
	const { t } = useTranslation('interface');
    const dispatch = useAppDispatch();
    const instance = useAppSelector(state => state.interface.currentInstance);
	const [loading, setLoading] = useState(false);
    const changePage = (page: string) => dispatch(setPage(page));
	const refresh = () => {
		setLoading(true);
        voxura.instances.refreshInstances().then(() => setLoading(false));
	};
	if (!items.length)
		return <Grid width="100%" vertical spacing={8} alignItems="center">
			<Typography size={20} margin="auto 0 0">
				{t('instance_list.empty')}
			</Typography>
			<Grid spacing={16}>
				<Buttons changePage={changePage}/>
			</Grid>
			<Grid margin="auto 0 0 auto">
				<Link size={14} onClick={refresh} padding="16px 24px" disabled={loading}>
					{loading ? <BasicSpinner size={14}/> : <IconBiArrowClockwise/>}
					{t('common.action.refresh')}
				</Link>
			</Grid>
		</Grid>;
    return <Grid width="100%" height="100%">
        <Grid width="30%" vertical>
            <InstanceList id={instance} items={items}/>
            <Grid width="100%" padding={16} background="$secondaryBackground" alignItems="center" justifyContent="space-between">
                <Buttons changePage={changePage}/>
            </Grid>
        </Grid>
        {instance && <InstancePage id={instance}/>}
    </Grid>;
}

export interface ButtonsProps {
	changePage: (page: string) => void
}
export function Buttons({ changePage }: ButtonsProps) {
	const { t } = useTranslation('interface');
	return <>
		<Button theme="accent" onClick={() => changePage('create')}>
			<IconBiPlusLg/>
			{t('common.action.create_instance')}
		</Button>
		<Button theme="secondary" onClick={() => changePage('import')}>
			<IconBiFolderPlus/>
			{t('import_file')}
		</Button>
	</>;
}