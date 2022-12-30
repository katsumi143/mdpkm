import { fetch } from '@tauri-apps/api/http';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, TextInput, InputLabel, Typography } from 'voxeliface';

import VersionPicker from '../../interface/components/VersionPicker';

import InstanceCreator from '.';
import voxura, { useComponentVersions } from '../../voxura';
import { JavaTemurin, MinecraftJava, ComponentVersion } from '../../../voxura';
import { MANIFESTS_URL, MinecraftJavaManifest, VersionManifestResponse } from '../../../voxura/src/component/minecraft-java';
export default class MinecraftJavaVanilla extends InstanceCreator {
    public static id = 'minecraft-java-vanilla';
    public async create(data: any[], save: boolean = true) {
        const instance = await voxura.instances.createInstance(data[0]);

		const manifests = await fetch<VersionManifestResponse>(MANIFESTS_URL);
		const manifestData = manifests.data.versions.find(m => m.id === data[1]);
		if (!manifestData)
			throw new Error('could not find manifest');

		const manifest = await fetch<MinecraftJavaManifest>(manifestData.url);
        instance.store.components.push(
			new MinecraftJava(instance, {
				version: data[1]
			}),
			new JavaTemurin(instance, {
				version: await JavaTemurin.getLatestVersion(manifest.data.javaVersion.majorVersion)
			})
		);
		if (save)
        	await instance.store.save();

        return instance;
    }

	public ReactComponent = Component;
}

export interface ComponentProps {
    setData: (value: any[]) => void
    setSatisfied: (value: boolean) => void
}
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
}