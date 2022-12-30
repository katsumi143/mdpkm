import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Button, Spinner, TextInput, Typography, BasicSpinner } from 'voxeliface';

import InstanceMod from './InstanceMod';

import type { Instance } from '../../../voxura';
export interface ModManagementProps {
	instance: Instance
}
export default function ModManagement({ instance }: ModManagementProps) {
    const { t } = useTranslation('interface');
    const [filter, setFilter] = useState('');
	const items = instance.modifications;
	const loading = instance.readingMods;
	const refresh = () => instance.readMods();
    useEffect(() => {
        if (instance.modifications.length === 0)
            instance.readMods();
    }, [instance.id]);
    return <React.Fragment>
       <Grid margin="4px 0" spacing={8} justifyContent="space-between">
			<Grid vertical>
				<Typography size={14} noSelect lineheight={1}>
					{t('mod_management')}
				</Typography>
				<Typography size={12} color="$secondaryColor" weight={400} noSelect>
					{loading ?
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
				<Button theme="secondary" onClick={refresh} disabled={loading}>
					{loading ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
					{t('common.action.refresh')}
				</Button>
				<Button theme="accent" disabled>
					{loading ? <BasicSpinner size={16}/> : <IconBiCloudArrowDown/>}
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
		).sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id)).map(mod =>
			<InstanceMod key={mod.id} mod={mod} instance={instance}/>
		) : <Spinner/>}
    </React.Fragment>;
}