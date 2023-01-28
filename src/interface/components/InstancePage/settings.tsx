import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Switch, Slider, Dialog, Button, TabItem, TextInput, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import Tabs from '../Tabs';
import JsonEditor from '../JsonEditor';

import { toast } from '../../../util';
import { useBind } from '../../../util/hooks';
import { TOTAL_SYSTEM_MEMORY } from '../../../util/constants';
import { Instance, InstanceState } from '../../../../voxura';
export interface InstanceSettingsProps {
	instance: Instance
}
export default function InstanceSettings({ instance }: InstanceSettingsProps) {
	const { t } = useTranslation('interface');
	const name = useBind(instance.name);
	const memory = useBind([instance.store.memoryAllocation]);
	const resolution = useBind(instance.store.gameResolution.size);
	const [tab, setTab] = useState(0);
	const [advanced, setAdvanced] = useState(false);

	const disabled = instance.state !== InstanceState.None;
	const deleteInstance = () => {
		instance.delete();
	};
	useEffect(() => {
		instance.store.gameResolution = { size: resolution.value };
		instance.store.memoryAllocation = memory.value[0];
		instance.store.save();
	}, [name.value, memory.value, resolution.value]);

	if (advanced)
		return <JsonEditor value={instance.store.data}/>;
	return <>
		<Tabs value={tab} onChange={setTab} css={{ height: '100%' }}>
			<TabItem name="General" icon={<IconBiGear/>} value={0} spacing={0} padding="0 8px !important">
				<InputLabel>
					{t('common.label.display_name')}
				</InputLabel>
				<TextInput {...name} disabled/>

				<InputLabel spaciouser>
					{t('instance_page.settings.resolution')}
				</InputLabel>
				<Grid spacing={8}>
					<Grid vertical>
						<InputLabel>{t('common.label.resolution_width')}</InputLabel>
						<TextInput
							width={80}
							value={Math.max(0, resolution.value[0] || 0).toString()}
							onChange={value => {
								const number = parseInt(value);
								resolution.onChange(val => [number, val[1]]);
							}}
							disabled={disabled}
						/>
					</Grid>
					<Grid vertical>
						<InputLabel>{t('common.label.resolution_height')}</InputLabel>
						<TextInput
							width={80}
							value={Math.max(0, resolution.value[1] || 0).toString()}
							onChange={value => {
								const number = parseInt(value);
								resolution.onChange(val => [val[0], number]);
							}}
							disabled={disabled}
						/>
					</Grid>
				</Grid>
				
				<Grid margin="auto 0 16px" vertical>
					<InputLabel spaciouser>
						{t('instance_page.settings.delete')}
					</InputLabel>
					<Dialog.Root>
						<Dialog.Trigger asChild>
							<Button theme="secondary" disabled={disabled}>
								<IconBiTrash3Fill fontSize={12}/>
								{t('common.action.delete')}
							</Button>
						</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Content>
								<Dialog.Title>{t('dialog.delete_instance')}</Dialog.Title>
								<Dialog.Description css={{ whiteSpace: 'pre' }}>
									{t('dialog.delete_instance.body', [instance.name])}
								</Dialog.Description>
								<Grid spacing={16} justifyContent="end">
									<Dialog.Close asChild>
										<Button theme="accent" onClick={deleteInstance}>
											<IconBiCheckLg/>
											{t('common.action.confirm')}
										</Button>
									</Dialog.Close>
									<Dialog.Close asChild>
										<Button theme="secondary">
											<IconBiXLg/>
											{t('common.action.cancel')}
										</Button>
									</Dialog.Close>
								</Grid>
							</Dialog.Content>
						</Dialog.Portal>
					</Dialog.Root>
				</Grid>
			</TabItem>
			<TabItem name="Advanced" icon={<IconBiGear/>} value={1} spacing={0} padding="0 8px !important" disabled>
				<InputLabel>
					{t('instance_page.settings.memory', [memory.value[0].toLocaleString('en', { minimumFractionDigits: 1 })])}
				</InputLabel>
				<Slider
					min={.5}
					max={Math.floor((TOTAL_SYSTEM_MEMORY / 1000000000) / 1.4)}
					step={.5}
					{...memory}
				/>

				<Typography size={14} color="$linkColor" margin="32px 0 0" onClick={() => setAdvanced(true)} css={{
					cursor: 'pointer'
				}}>
					Edit Store File
				</Typography>
			</TabItem>
		</Tabs>
		{disabled && <Typography size={12} color="#ffba64" margin="8px 16px" noSelect>
			<IconBiExclamationTriangleFill/>
			{t('instance_page.settings.disabled')}
		</Typography>}
	</>;
}