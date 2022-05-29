import React, { useState, useEffect } from 'react';
import nbt from 'nbt';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { PlusLg, PencilFill, Trash3Fill, ArrowClockwise } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';

import Util from '../common/util';

export default function ResourcePackManagement({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const [items, setItems] = useState();
    const [filter, setFilter] = useState('');
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
    return <React.Fragment>
        <Grid margin="4px 0" spacing={8} justifyContent="space-between">
            <Grid direction="vertical">
                <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                    {t('app.mdpkm.resourcepack_management.title')}
                </Typography>
                <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
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
                    {items === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                    {t('app.mdpkm.common:actions.refresh')}
                </Button>
                <Button theme="accent" disabled>
                    <PlusLg/>
                    {t('app.mdpkm.resourcepack_management.add')}
                </Button>
            </Grid>
        </Grid>
        {Array.isArray(items) && items?.filter(({ name }) =>
            name.toLowerCase().includes(filter)
        ).map((item, index) =>
            <Grid key={index} padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{
                position: 'relative'
            }}>
                <Image
                    src={item.icon ? `data:image/png;base64,${item.icon}` : 'img/icons/minecraft/unknown_pack.png'}
                    size={46}
                    background="$secondaryBackground"
                    borderRadius={4}
                    css={{
                        minWidth: 46,
                        minHeight: 46,
                        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                        '&:hover': {
                            minWidth: 64,
                            minHeight: 64
                        }
                    }}
                />
                <Grid spacing={4} direction="vertical">
                    <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                        {item.name}
                    </Typography>
                    <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        {item.metadata.pack?.description}
                    </Typography>
                </Grid>
                <Grid spacing={8} css={{
                    right: 16,
                    position: 'absolute'
                }}>
                    <Button theme="secondary" disabled>
                        <Trash3Fill/>
                        {t('app.mdpkm.common:actions.delete')}
                    </Button>
                </Grid>
            </Grid>
        )}
    </React.Fragment>;
};