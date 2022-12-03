import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import React, { useState, useEffect } from 'react';

import ImagePreview from './ImagePreview';
import { Link, Grid, Image, Button, Typography, BasicSpinner } from '../../../voxeliface';

import Util from '../../common/util';
import Patcher from '../../plugins/patcher';
import { useInstance } from '../../voxura';
import { useAppSelector } from '../../store/hooks';
export type ResourcePackManagementProps = {
    instanceId: string
};
export default Patcher.register(function ResourcePackManagement({ instanceId }: ResourcePackManagementProps) {
    const { t } = useTranslation();
    const instance = useInstance(instanceId);
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
    useEffect(() => setItems(null), [instanceId]);
    return <React.Fragment>
        <Grid margin="4px 0" spacing={8} justifyContent="space-between">
            <Grid vertical>
                <Typography size={14} lineheight={1}>
                    {t('app.mdpkm.resourcepack_management.title')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400}>
                    {items === 'loading' || !items ?
                        t('app.mdpkm.common:states.loading') :
                        t(`app.mdpkm.resourcepack_management.count${items.length === 1 ? '1' : ''}`, {
                            val: items.length
                        })
                    }
                </Typography>
            </Grid>
            <Grid spacing={8}>
                <Button theme="secondary" onClick={() => setItems(null)} disabled={items === 'loading'}>
                    {items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                    {t('app.mdpkm.common:actions.refresh')}
                </Button>
                <Button theme="accent" onClick={addResourcePack} disabled={instance?.store.gameComponent.id === 'bedrock'}>
                    <IconBiPlusLg/>
                    {t('app.mdpkm.resourcepack_management.add')}
                </Button>
            </Grid>
        </Grid>
        {Array.isArray(items) && items?.filter(({ name }) =>
            name.toLowerCase().includes(filter)
        ).map((item, key) => <ResourcePack key={key} item={item}/>)}
    </React.Fragment>;
});

export type ResourcePackProps = {
    item: any
};
function ResourcePack({ item }: ResourcePackProps) {
    const { t } = useTranslation();
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
            size={isCompact ? 38 : 46}
            onClick={() => setPreviewIcon(true)}
            background="$secondaryBackground"
            borderRadius={8}
            css={{
                cursor: 'zoom-in',
                boxShadow: '$buttonShadow'
            }}
        />
        {previewIcon && <ImagePreview src={packIcon} size={192} onClose={() => setPreviewIcon(false)} pixelated/>}
        <Grid spacing={2} vertical>
            <Typography size={isCompact ? 14 : 16} lineheight={1}>
                {item.name}
            </Typography>
            <Typography size={isCompact ? 10 : 12} color="$secondaryColor" lineheight={1}>
                {item.metadata.pack?.description}
            </Typography>
        </Grid>
        <Grid height="100%" spacing={8} css={{
            right: 0,
            position: 'absolute'
        }}>
            <Link size={12} padding="0 16px">
                <IconBiTrash3Fill/>
                {t('app.mdpkm.common:actions.delete')}
            </Link>
        </Grid>
    </Grid>;
};