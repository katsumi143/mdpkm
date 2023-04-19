import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/dialog';
import * as shell from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Button, Spinner, TextInput, Typography, BasicSpinner } from 'voxeliface';
import { exists, readDir, copyFile, createDir, readTextFile, readBinaryFile } from '@tauri-apps/api/fs';

import ResourcePackItem from './item';
import { useAppDispatch } from '../../../../store/hooks';
import { Instance, ProjectType } from '../../../../../voxura';
import { setPage, setSearchType } from '../../../../store/slices/interface';
import { readTextFileInZip, readBinaryFileInZip } from '../../../../util';
export interface ResourcePackManagementProps {
    instance: Instance
}
export default function ResourePacks({ instance }: ResourcePackManagementProps) {
	const path = instance.path + '/resourcepacks';
    const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
    const [items, setItems] = useState<any[] | string | null>(null);
    const [filter, setFilter] = useState('');
	const search = () => {
		dispatch(setPage('search'));
		dispatch(setSearchType(ProjectType.ResourcePack));
	};
    const addResourcePack = async() => {
        const filePath = await open({
            title: 'Select Resource Pack',
            filters: [{ name: 'Resource Packs', extensions: ['zip'] }]
        });
        if (typeof filePath !== 'string')
            return;
        const split = filePath.split(/\/+|\\+/);
        const packName = split.reverse()[0];
        await createDir(path, { recursive: true });
        await copyFile(filePath, `${path}/${packName}`);

        toast.success(`Successfully added ${packName}!`, { duration: 5000 });
        setItems(null);
    };
    useEffect(() => {
        if (!items) {
            if (!instance)
                return;
            setItems('loading');
            exists(path).then(exists => {
                if (exists)
                    readDir(path).then(async entries => {
                        const resourcePacks = [];
                        for (const { name, path, children } of entries) {
                            try {
                                const icon = await (children ?
                                    readBinaryFile(`${path}/pack.png`) :
                                    readBinaryFileInZip(path, 'pack.png')
                                ).catch(console.warn);
                                const metadata = await (children ?
                                    readTextFile(`${path}/pack.mcmeta`) :
                                    readTextFileInZip(path, 'pack.mcmeta')
                                ).then(JSON.parse);
                                resourcePacks.push({
                                    name,
                                    icon,
                                    metadata
                                });
                            } catch(err) {
                                console.warn(err);
                            }
                        }
                        setItems(resourcePacks);
                    });
                else
                    setItems([]);
            });
        }
    }, [items]);
    useEffect(() => setItems(null), [instance.id]);
    return <React.Fragment>
        <Grid margin="4px 0" justifyContent="space-between">
            <Grid vertical>
                <Typography size={14} noSelect lineheight={1}>
                    {t('resource_packs')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400} noSelect>
                    {items === 'loading' || !items ?
                        t('common.label.loading') :
                        t('common.label.items', { count: items.length })
                    }
                </Typography>
            </Grid>
			<Grid spacing={8}>
				<TextInput
					width={256}
					value={filter}
					onChange={setFilter}
					placeholder={t('resource_packs.filter')}
				/>
				<Button theme="secondary" onClick={() => setItems(null)} disabled={items === 'loading'}>
					{items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
					{t('common.action.refresh')}
				</Button>
				<Button theme="secondary" onClick={() => shell.open(path)}>
					<IconBiFolder2Open/>
					{t('common.action.open_folder')}
				</Button>
			</Grid>
        </Grid>
		<Grid spacing={8} vertical cornerRadius={16} css={{ overflow: 'hidden auto' }}>
			{Array.isArray(items) ? items.length ?
				items?.filter(({ name }) =>
					name.toLowerCase().includes(filter)
				).map((item, key) => <ResourcePackItem key={key} item={item}/>)
			: <Typography noSelect>
				{t('common.label.empty_dir')}
			</Typography> : <Spinner/>}
		</Grid>
		<Grid margin="auto 0 16px" spacing={8}>
			<Button theme="accent" onClick={search}>
				<IconBiSearch/>
				{t('resource_packs.search')}
			</Button>
			<Button theme="accent" onClick={addResourcePack} disabled={instance?.store.gameComponent.id === 'bedrock'}>
				<IconBiPlusLg/>
				{t('resource_packs.add')}
			</Button>
		</Grid>
    </React.Fragment>;
}