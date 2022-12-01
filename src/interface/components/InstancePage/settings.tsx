import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import JsonEditor from '../JsonEditor';
import { Grid, Slider, Dialog, Button, TextInput, Typography, InputLabel, BasicSpinner } from '../../../../voxeliface';

import { toast } from '../../../util';
import type { Instance } from '../../../voxura';
export type InstanceSettingsProps = {
    instance: Instance
};

const totalMemory = 8000000000;
export default function InstanceSettings({ instance }: InstanceSettingsProps) {
    const { t } = useTranslation();
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
        <Grid spacing={8} padding="4px 0" justifyContent="space-between">
            <Grid direction="vertical">
                <Typography size={14} lineheight={1}>
                    {t('app.mdpkm.instance_page.tabs.settings.title')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400}>
                    {instance.name}
                </Typography>
            </Grid>
            <Grid spacing={8}>
                <Button theme="accent" onClick={saveSettings} disabled={saving}>
                    {saving ? <BasicSpinner size={16}/> : <IconBiPencilFill fontSize={11}/>}
                    {t('app.mdpkm.common:actions.save_changes')}
                </Button>
            </Grid>
        </Grid>
        <Grid direction="vertical">
            <InputLabel>
                {t('app.mdpkm.instance_page.tabs.settings.instance_name')}
            </InputLabel>
            <TextInput value={name} onChange={setName}/>

            <InputLabel spaciouser>
                {t('app.mdpkm.instance_page.tabs.settings.memory_alloc', {
                    val: memory[0].toLocaleString('en', { minimumFractionDigits: 1 })
                })}
            </InputLabel>
            <Slider
                min={.5}
                max={Math.floor((totalMemory / 1000000000) / 1.4)}
                step={.5}
                value={memory}
                onChange={setMemory}
            />

            <InputLabel spaciouser>
                {t('app.mdpkm.instance_page.tabs.settings.resolution')}
            </InputLabel>
            <Grid spacing={8}>
                <Grid direction="vertical">
                    <Typography size=".8rem" color="$secondaryColor">
                        {t('app.mdpkm.instance_page.tabs.settings.resolution.width')}
                    </Typography>
                    <TextInput
                        width={80}
                        value={Math.max(0, resolution[0] || 0).toString()}
                        onChange={value => {
                            const number = parseInt(value);
                            setResolution(val => [number, val[1]]);
                        }}
                    />
                </Grid>
                <Grid direction="vertical">
                    <Typography size=".8rem" color="$secondaryColor">
                        {t('app.mdpkm.instance_page.tabs.settings.resolution.height')}
                    </Typography>
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
                {t('app.mdpkm.instance_page.tabs.settings.delete')}
            </InputLabel>
            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <Button theme="secondary" disabled={saving}>
                        <IconBiTrash3Fill style={{fontSize: 11}}/>
                        {t('app.mdpkm.common:actions.delete')}
                    </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Title>Are you absolutely sure?</Dialog.Title>
                    <Dialog.Description>
                        This action cannot be undone.<br/>
                        '{instance.name}' will be lost forever! (A long time!)
                    </Dialog.Description>
                    <Grid margin="25 0 0" justifyContent="end">
                        <Dialog.Close asChild>
                            <Button theme="accent" onClick={deleteInstance}>
                                Yes, delete Instance
                            </Button>
                        </Dialog.Close>
                    </Grid>
                </Dialog.Content>
            </Dialog.Root>

            <Typography size={14} color="$linkColor" margin="32px 0 0" onClick={() => setAdvanced(true)} css={{
                cursor: 'pointer'
            }}>
                Advanced Settings...
            </Typography>
        </Grid>
    </React.Fragment>;
};