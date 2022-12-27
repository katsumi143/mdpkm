import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Select, TextInput, InputLabel, Typography } from 'voxeliface';

import VersionPicker from '../../interface/components/VersionPicker';

import InstanceCreator from '.';
import MinecraftJavaCreator from './minecraft-java-vanilla';
import { useComponentVersions } from '../../voxura';
import type { ComponentVersion } from '../../../voxura/src/types';
import { MinecraftJava, MinecraftFabric } from '../../../voxura';
export default class FabricLoader extends InstanceCreator {
    public static id = 'fabric';
    public async create(data: any[]) {
        const instance = await new MinecraftJavaCreator().create(data, false);
        instance.store.components.push(
            new this.component(instance, {
                version: data[2]
            })
        );
        await instance.store.save();

        return instance;
    }

    public render(setData: (value: any[]) => void, setSatisfied: (value: boolean) => void) {
        return <Component creator={this} setData={setData} setSatisfied={setSatisfied}/>;
    }

    public readonly component = MinecraftFabric;
};

export type ComponentProps = {
	creator: FabricLoader
    setData: (value: any[]) => void
    setSatisfied: (value: boolean) => void
};
function Component({ setData, creator, setSatisfied }: ComponentProps) {
    const { t } = useTranslation('interface');
    const [name, setName] = useState('');
    const [version, setVersion] = useState<ComponentVersion | null>(null);
    const [version2, setVersion2] = useState<number>(0);
    const versions = useComponentVersions(MinecraftJava);
    const versions2 = useComponentVersions(creator.component)?.[0];
    useEffect(() => {
        setData([name, version?.id, versions2?.[version2]?.id]);
        setSatisfied(!!name && !!versions && !!versions2);
    }, [name, version, version2, versions, versions2]);
    return <Grid width="100%" height="100%" spacing={16}>
        <Grid vertical>
            <InputLabel>{t('common.label.instance_name')}</InputLabel>
            <TextInput value={name} onChange={setName} placeholder={t('common.input_placeholder.required')}/>

            <InputLabel spacious>{t('common.label.minecraft_version')}</InputLabel>
            <Typography size={14} noSelect>
                {version ? `${t(`voxura:component.${MinecraftJava.id}.release_category.${version.category}.singular`)} ${version.id}` : t('common.input_placeholder.required')}
            </Typography>

            <InputLabel spacious>{t('common.label.val_version', {
                val: t(`voxura:component.${creator.component.id}`)
            })}</InputLabel>
            <Select.Minimal value={version2} loading={!versions2} onChange={setVersion2}>
                <Select.Group name={t('common.select_group.component_versions')}>
                    {versions2?.map((version, key) => <Select.Item key={key} value={key}>
                        {version.id}
                    </Select.Item>)}
                </Select.Group>
            </Select.Minimal>
        </Grid>
        {versions && <VersionPicker id={MinecraftJava.id} value={version} versions={versions} onChange={setVersion}/>}
    </Grid>;
};