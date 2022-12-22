import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, TextInput, InputLabel, Typography } from 'voxeliface';

import VersionPicker from '../../interface/components/VersionPicker';

import InstanceCreator from '.';
import voxura, { useComponentVersions } from '../../voxura';
import { MinecraftJava, ComponentVersion } from '../../../voxura';
export default class MinecraftJavaVanilla extends InstanceCreator {
    public static id = 'minecraft-java-vanilla';
    public async create(data: any[]) {
        const instance = await voxura.instances.createInstance(data[0]);
        instance.store.components.push(new MinecraftJava(instance, {
            version: data[1]
        }));
        await instance.store.save();

        return instance;
    }

    public render(setData: (value: any[]) => void, setSatisfied: (value: boolean) => void) {
        return <Component setData={setData} setSatisfied={setSatisfied}/>;
    }
};

export type ComponentProps = {
    setData: (value: any[]) => void,
    setSatisfied: (value: boolean) => void
};
function Component({ setData, setSatisfied }: ComponentProps) {
    const { t } = useTranslation('interface');
    const [name, setName] = useState('');
    const [version, setVersion] = useState<ComponentVersion | null>(null);
    const versions = useComponentVersions(MinecraftJava);
    useEffect(() => {
        setData([name, version?.id]);
        setSatisfied(!!name && !!versions);
    }, [name, version, versions]);
    return <Grid width="100%" height="100%" spacing={16}>
        <Grid vertical>
            <InputLabel>{t('common.label.instance_name')}</InputLabel>
            <TextInput value={name} onChange={setName} placeholder={t('common.input_placeholder.required')}/>

            <InputLabel spacious>{t('common.label.minecraft_version')}</InputLabel>
            <Typography size={14} noSelect>
                {version ? `${t(`voxura:component.${MinecraftJava.id}.release_category.${version.category}.singular`)} ${version.id}` : t('common.input_placeholder.required')}
            </Typography>
        </Grid>
        {versions && <VersionPicker id={MinecraftJava.id} value={version} versions={versions} onChange={setVersion}/>}
    </Grid>
};