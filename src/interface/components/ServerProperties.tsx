import { readTextFile } from '@tauri-apps/api/fs';
import { useTranslation } from 'react-i18next';
import { propertiesToJson } from 'properties-file/content';
import type { KeyValueObject } from 'properties-file';
import React, { useState, useEffect } from 'react';
import { Grid, Select, Switch, TextInput, Typography, InputLabel } from 'voxeliface';

import type { Instance } from '../../../voxura';
export interface ServerPropertiesProps {
	instance: Instance
}
export default function ServerProperties({ instance }: ServerPropertiesProps) {
	const { t } = useTranslation('interface');
	const properties = useProperties(instance);
	if (!properties)
		return null;

	console.log(properties);
	return <Grid vertical>
		<InputLabel>{t('server_settings.pvp')}</InputLabel>
		<Grid spacing={8} alignItems="center">
			<Switch value={Boolean(properties.pvp)}/>
			<Typography size={14} color="$secondaryColor" weight={400} family="$secondary">
				{t(`common.label.toggle_${properties.pvp}`)}
			</Typography>
		</Grid>

		<InputLabel spaciouser>{t('server_settings.gamemode')}</InputLabel>
		<Select.Minimal value={properties.gamemode}>
			<Select.Group name="Gamemodes">
				{GAMEMODES.map(name => <Select.Item key={name} value={name}>
					{t(`server_settings.gamemode.${name}`)}
				</Select.Item>)}
			</Select.Group>
		</Select.Minimal>

		<InputLabel spaciouser>{t('server_settings.world_name')}</InputLabel>
		<TextInput width="100%" value={properties['level-name']}/>
	</Grid>;
}

export function useProperties(instance: Instance) {
	const [value, setValue] = useState<KeyValueObject | null>(null);
	useEffect(() => {
		readTextFile(instance.path + '/server.properties').then(propertiesToJson).then(setValue);
	}, []);

	return value;
}
export const GAMEMODES = ['survival', 'creative', 'adventure']
export const DIFFICULTIES = ['peaceful', 'easy', 'normal', 'hard']