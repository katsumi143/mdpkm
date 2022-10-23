import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/dialog';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';

import Util from '../common/util';
import Patcher from '/src/common/plugins/patcher';
import { useInstance } from '../common/voxura';
export default Patcher.register(function ResourcePackManagement({ instanceId }) {
    const { t } = useTranslation();
    const instance = useInstance(instanceId);
    const isCompact = useSelector(state => state.settings.uiStyle) === 'compact';
    const [items, setItems] = useState();
    const [filter, setFilter] = useState('');
    const addResourcePack = async() => {
        const path = await open({
            title: 'Select Resource Pack',
            filters: [{ name: 'Resource Packs', extensions: ['zip'] }]
        });
        const split = path.split(/\/+|\\+/);
        const packName = split.reverse()[0];
        const packsPath = `${instance.path}/resourcepacks`;
        await Util.createDirAll(packsPath);
        await Util.moveFolder(path, `${packsPath}/${packName}`);

        toast.success(`Successfully added ${packName}!`, { duration: 5000 });
        setItems();
    };
    useEffect(() => {
        if(!items) {
            if(!instance?.path)
                return;
            const path = `${instance.path}/resourcepacks`;
            setItems('loading');
            Util.fileExists(path).then(exists => {
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
                                    Util.readTextFile(`${path}/pack.mcmeta`) :
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
    useEffect(() => setItems(), [instanceId]);
    return <React.Fragment>
        <Grid margin="4px 0" spacing={8} justifyContent="space-between">
            <Grid direction="vertical">
                <Typography size=".9rem" lineheight={1}>
                    {t('app.mdpkm.resourcepack_management.title')}
                </Typography>
                <Typography size=".7rem" color="$secondaryColor" weight={400}>
                    <TextTransition inline>
                        {items === 'loading' || !items ?
                            t('app.mdpkm.common:states.loading') :
                            t(`app.mdpkm.resourcepack_management.count${items.length === 1 ? '1' : ''}`, {
                                val: items.length
                            })
                        }
                    </TextTransition>
                </Typography>
            </Grid>
            <Grid spacing={8}>
                <Button theme="secondary" onClick={() => setItems()} disabled={items === 'loading'}>
                    {items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise size={14}/>}
                    {t('app.mdpkm.common:actions.refresh')}
                </Button>
                <Button theme="accent" onClick={addResourcePack} disabled={instance?.config.loader.type === 'bedrock'}>
                    <IconBiPlusLg/>
                    {t('app.mdpkm.resourcepack_management.add')}
                </Button>
            </Grid>
        </Grid>
        {Array.isArray(items) && items?.filter(({ name }) =>
            name.toLowerCase().includes(filter)
        ).map((item, index) =>
            <Grid key={index} padding={8} spacing={isCompact ? 10 : 12} alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{
                position: 'relative'
            }}>
                <Image
                    src={item.icon ? `data:image/png;base64,${item.icon}` : 'img/icons/minecraft/unknown_pack.png'}
                    size={isCompact ? 38 : 46}
                    background="$secondaryBackground"
                    borderRadius={4}
                />
                <Grid spacing={2} direction="vertical">
                    <Typography size={isCompact ? 14 : 16} lineheight={1}>
                        {item.name}
                    </Typography>
                    <Typography size={isCompact ? 10 : 12} color="$secondaryColor" lineheight={1}>
                        {item.metadata.pack?.description}
                    </Typography>
                </Grid>
                <Grid spacing={8} css={{
                    right: 16,
                    position: 'absolute'
                }}>
                    <Button theme="secondary" disabled>
                        <IconBiTrash3Fill style={{fontSize: 11}}/>
                        {t('app.mdpkm.common:actions.delete')}
                    </Button>
                </Grid>
            </Grid>
        )}
    </React.Fragment>;
});