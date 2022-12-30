import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import React, { useState, useEffect } from 'react';
import { Link, Grid, Image, Button, Spinner, Typography, BasicSpinner } from 'voxeliface';

import ImagePreview from './ImagePreview';

import Util from '../../common/util';
import type { Instance } from '../../../voxura';
import { useAppSelector } from '../../store/hooks';
export interface ResourcePackManagementProps {
    instance: Instance
}
export default function ResourcePackManagement({ instance }: ResourcePackManagementProps) {
    const { t } = useTranslation('interface');
    const [items, setItems] = useState<any[] | string | null>(null);
    const [filter, setFilter] = useState('');
    const addResourcePack = async() => {
        const path = await open({
            title: 'Select Resource Pack',
            filters: [{ name: 'Resource Packs', extensions: ['zip'] }]
        });
        if (typeof path !== 'string')
            return;
        const split = path.split(/\/+|\\+/);
        const packName = split.reverse()[0];
        const packsPath = `${instance?.path}/resourcepacks`;
        await Util.createDirAll(packsPath);
        await Util.moveFolder(path, `${packsPath}/${packName}`);

        toast.success(`Successfully added ${packName}!`, { duration: 5000 });
        setItems(null);
    };
    useEffect(() => {
        if (!items) {
            if (!instance)
                return;
            const path = `${instance.path}/resourcepacks`;
            setItems('loading');
            exists(path).then(exists => {
                if (exists)
                    Util.readDir(path).then(async files => {
                        const resourcePacks = [];
                        for (const { name, path, isDir } of files) {
                            try {
                                const icon = await (isDir ?
                                    Util.readFileBase64(`${path}/pack.png`) :
                                    Util.readFileInZipBase64(path, 'pack.png')
                                ).catch(console.warn);
                                const metadata = await (isDir ?
                                    readTextFile(`${path}/pack.mcmeta`) :
                                    Util.readFileInZip(path, 'pack.mcmeta')
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
        <Grid margin="4px 0" spacing={8} justifyContent="space-between">
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
                <Button theme="secondary" onClick={() => setItems(null)} disabled={items === 'loading'}>
                    {items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                    {t('common.action.refresh')}
                </Button>
                <Button theme="accent" onClick={addResourcePack} disabled={instance?.store.gameComponent.id === 'bedrock'}>
                    <IconBiPlusLg/>
                    {t('resource_packs.add')}
                </Button>
            </Grid>
        </Grid>
        {Array.isArray(items) ? items.length ?
			items?.filter(({ name }) =>
				name.toLowerCase().includes(filter)
			).map((item, key) => <ResourcePack key={key} item={item}/>)
		: <Typography noSelect>
			{t('common.label.empty_dir')}
		</Typography> : <Spinner/>}
    </React.Fragment>;
}

// TODO: move this into a separate file
export interface ResourcePackProps {
    item: any
}
export function ResourcePack({ item }: ResourcePackProps) {
    const { t } = useTranslation('interface');
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const [previewIcon, setPreviewIcon] = useState(false);

    const packIcon = item.icon ? `data:image/png;base64,${item.icon}` : 'img/icons/minecraft/unknown_pack.png';
    return <Grid padding={8} spacing={isCompact ? 10 : 12} alignItems="center" background="$secondaryBackground2" borderRadius={16} css={{
        border: 'transparent solid 1px',
        position: 'relative',
        background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
    }}>
        <Image
            src={packIcon}
            size={isCompact ? 38 : 48}
            onClick={() => setPreviewIcon(true)}
            background="$secondaryBackground"
            borderRadius={8}
            css={{
                cursor: 'zoom-in',
                boxShadow: '$buttonShadow'
            }}
        />
        {previewIcon && <ImagePreview src={packIcon} onClose={() => setPreviewIcon(false)} pixelated/>}
        <Grid spacing={2} vertical>
            <Typography size={isCompact ? 14 : 16} noSelect lineheight={1}>
                {item.name}
            </Typography>
            <Typography size={isCompact ? 10 : 12} color="$secondaryColor" noSelect lineheight={1}>
                {item.metadata.pack?.description}
            </Typography>
        </Grid>
        <Grid height="100%" spacing={8} css={{
            right: 0,
            position: 'absolute'
        }}>
            <Link size={12} padding="0 16px">
                <IconBiTrash3Fill/>
                {t('common.action.delete')}
            </Link>
        </Grid>
    </Grid>;
}