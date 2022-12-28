import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Slider, Dialog, Button, TabItem, TextInput, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import Tabs from '../Tabs';
import JsonEditor from '../JsonEditor';

import { toast } from '../../../util';
import type { Instance } from '../../../../voxura';
import { TOTAL_SYSTEM_MEMORY } from '../../../util/constants';
export interface InstanceSettingsProps {
    instance: Instance
}
export default function InstanceSettings({ instance }: InstanceSettingsProps) {
    const { t } = useTranslation('interface');
	const [tab, setTab] = useState(0);
    const [name, setName] = useState(instance.name);
    const [saving, setSaving] = useState(false);
    const [memory, setMemory] = useState([instance.store.memoryAllocation]);
    const [advanced, setAdvanced] = useState(false);
    const [resolution, setResolution] = useState(instance.store.gameResolution);
    const deleteInstance = () => {
        instance.delete();
    };
    const saveSettings = () => {
        setSaving(true);

        instance.store.memoryAllocation = memory[0];
        instance.store.save().then(() => {
            toast('Changes saved', 'woohoo');
            setSaving(false);
        });
    };
    useEffect(() => {
        setName(instance.name);
        setMemory([instance.store.memoryAllocation]);
        setResolution(instance.store.gameResolution);
    }, [instance.name, instance.store.memoryAllocation, instance.store.gameResolution]);

    if (advanced)
        return <JsonEditor value={instance.store.data}/>;
    return <React.Fragment>
        <Tabs value={tab} onChange={setTab} css={{ height: '100%' }}>
			<TabItem name="General" icon={<IconBiGear/>} value={0} spacing={0} padding="0 8px !important">
				<InputLabel>
					{t('instance_page.settings.name')}
				</InputLabel>
				<TextInput value={name} onChange={setName}/>

				<InputLabel spaciouser>
					{t('instance_page.settings.resolution')}
				</InputLabel>
				<Grid spacing={8}>
					<Grid vertical>
						<InputLabel>{t('common.label.resolution_width')}</InputLabel>
						<TextInput
							width={80}
							value={Math.max(0, resolution[0] || 0).toString()}
							onChange={value => {
								const number = parseInt(value);
								setResolution(val => [number, val[1]]);
							}}
						/>
					</Grid>
					<Grid vertical>
						<InputLabel>{t('common.label.resolution_height')}</InputLabel>
						<TextInput
							width={80}
							value={Math.max(0, resolution[1] || 0).toString()}
							onChange={value => {
								const number = parseInt(value);
								setResolution(val => [val[0], number]);
							}}
						/>
					</Grid>
				</Grid>
				
				<InputLabel spaciouser>
					{t('instance_page.settings.delete')}
				</InputLabel>
				<Dialog.Root>
					<Dialog.Trigger asChild>
						<Button theme="secondary" disabled={saving}>
							<IconBiTrash3Fill fontSize={12}/>
							{t('common.action.delete')}
						</Button>
					</Dialog.Trigger>
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
				</Dialog.Root>
			</TabItem>
			<TabItem name="Advanced" icon={<IconBiGear/>} value={1} spacing={0} padding="0 8px !important">
				<InputLabel>
					{t('instance_page.settings.memory', [memory[0].toLocaleString('en', { minimumFractionDigits: 1 })])}
				</InputLabel>
				<Slider
					min={.5}
					max={Math.floor((TOTAL_SYSTEM_MEMORY / 1000000000) / 1.4)}
					step={.5}
					value={memory}
					onChange={setMemory}
				/>

				<Typography size={14} color="$linkColor" margin="32px 0 0" onClick={() => setAdvanced(true)} css={{
					cursor: 'pointer'
				}}>
					Edit Store File
				</Typography>
			</TabItem>
        </Tabs>
		<Button theme="accent" onClick={saveSettings} disabled={saving}>
			{saving ? <BasicSpinner size={16}/> : <IconBiPencilFill fontSize={11}/>}
			{t('common.action.save_changes')}
		</Button>
    </React.Fragment>;
}