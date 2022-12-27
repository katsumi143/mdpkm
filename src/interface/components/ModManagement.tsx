import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Button, Spinner, TextInput, Typography, BasicSpinner } from 'voxeliface';

import InstanceMod from './InstanceMod';

import type Mod from '../../../voxura/src/util/mod';
import type { Instance } from '../../../voxura';
export type ModManagementProps = {
	instance: Instance
};
export default function ModManagement({ instance }: ModManagementProps) {
    const { t } = useTranslation('interface');
    const [items, setItems] = useState<Mod[] | string>('loading');
    const [filter, setFilter] = useState('');
    const [updates, setUpdates] = useState();
    const [updateChecking, setUpdateChecking] = useState(false);
    const checkForUpdates = () => {
        /*setUpdateChecking(true);
        instance.checkForUpdates().then(updates => {
            setUpdates(updates);
            setUpdateChecking(false);
        });*/
    };
    const refreshList = () => {
        setItems('loading');
        instance.readMods().then(setItems);
    };
    useEffect(() => {
        setItems('loading');
        if (instance.modifications.length > 0)
            setItems(instance.modifications);
        else
            refreshList();
    }, [instance.id]);
    return <React.Fragment>
       <Grid margin="4px 0" spacing={8} justifyContent="space-between">
			<Grid vertical>
				<Typography size={14} noSelect lineheight={1}>
					{t('mod_management')}
				</Typography>
				<Typography size={12} color="$secondaryColor" weight={400} noSelect>
					{items === 'loading' || !items ?
						t('app.mdpkm.common:states.loading') :
						t('mod_management.count', [items.length])
					}
				</Typography>
			</Grid>
			<Grid spacing={8}>
				<TextInput
					width={144}
					value={filter}
					onChange={setFilter}
					placeholder={t('mod_management.search')}
				/>
				<Button theme="secondary" onClick={refreshList} disabled={items === 'loading'}>
					{items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
					{t('common.action.refresh')}
				</Button>
				<Button theme="accent" onClick={checkForUpdates} disabled={updateChecking}>
					{updateChecking ? <BasicSpinner size={16}/> : <IconBiCloudArrowDown/>}
					{t('mod_management.update')}
				</Button>
			</Grid>
		</Grid>
		{Array.isArray(items) ? items.length === 0 ?
			<React.Fragment>
				<Typography size="1.2rem" family="$primarySans">
					{t('app.mdpkm.common:headers.empty_list')}
				</Typography>
				<Typography size=".9rem" color="$secondaryColor" weight={400} textalign="start" lineheight={0} css={{ display: 'block' }}>
					Find some mods via the <b>Mod Search</b> tab!
				</Typography>
			</React.Fragment>
		: items.filter(({ id, name }) =>
			id?.toLowerCase().includes(filter) ||
			name?.toLowerCase().includes(filter)
		).sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id)).map((mod, index) =>
			<InstanceMod key={index} mod={mod} updates={updates} instance={instance}/>
		) : <Spinner/>}
    </React.Fragment>;
};