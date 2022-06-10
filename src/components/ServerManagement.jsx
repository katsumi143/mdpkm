import React, { useState, useEffect } from 'react';
import nbt from 'nbt';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { PlusLg, PencilFill, Trash3Fill, ArrowClockwise } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';

import Util from '../common/util';

export default function ServerManagement({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const [items, setItems] = useState();
    const [filter, setFilter] = useState('');
    useEffect(() => {
        if(!items) {
            if(!instance?.path)
                return;
            const path = `${instance.path}/servers.dat`;
            setItems('loading');
            Util.fileExists(path).then(exists => {
                if (exists)
                    Util.readBinaryFile(path).then(data => nbt.parse(data, (error, data) => {
                        if(error) throw error;
                        setItems(data.value.servers.value.value);
                    }));
                else
                    setItems([]);
            });
        }
    }, [items]);
    useEffect(() => setItems(), [instanceId]);
    return <React.Fragment>
        <Grid spacing={8} padding="4px 0" justifyContent="space-between">
            <Grid direction="vertical">
                <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                    {t('app.mdpkm.server_management.title')}
                </Typography>
                <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
                    <TextTransition inline>
                        {items === 'loading' || !items ?
                            t('app.mdpkm.common:states.loading') :
                            t(`app.mdpkm.server_management.count${items.length === 1 ? '1' : ''}`, {
                                val: items.length
                            })
                        }
                    </TextTransition>
                </Typography>
            </Grid>
            <Grid spacing={8}>
                <TextInput
                    width={144}
                    value={filter}
                    onChange={setFilter}
                    placeholder={t('app.mdpkm.server_management.search')}
                />
                <Button theme="secondary" onClick={() => setItems()} disabled={items === 'loading'}>
                    {items === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                    {t('app.mdpkm.common:actions.refresh')}
                </Button>
                <Button theme="accent" disabled>
                    <PlusLg/>
                    {t('app.mdpkm.server_management.add')}
                </Button>
            </Grid>
        </Grid>
        <Grid spacing={8} direction="vertical">
            {Array.isArray(items) && items?.filter(({ ip, name }) =>
                ip?.value.toLowerCase().includes(filter) ||
                name?.value.toLowerCase().includes(filter)
            ).map((item, index) =>
                <Grid key={index} padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{
                    position: 'relative'
                }}>
                    <Image
                        src={item.icon ? `data:image/png;base64,${item.icon.value}` : 'img/icons/minecraft/unknown_server.png'}
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
                            {item.name?.value}
                            {item.acceptTextures?.value === 1 &&
                                <Typography size=".7rem" color="$secondaryColor" weight={300} family="Nunito" margin="4px 0 0 8px" lineheight={1}>
                                    Server Resource Pack Accepted
                                </Typography>
                            }
                        </Typography>
                        <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                            {item.ip?.value}
                        </Typography>
                    </Grid>
                    <Grid spacing={8} css={{
                        right: 16,
                        position: 'absolute'
                    }}>
                        <Button theme="secondary" disabled>
                            <PencilFill/>
                            {t('app.mdpkm.common:actions.edit')}
                        </Button>
                        <Button theme="secondary" disabled>
                            <Trash3Fill/>
                            {t('app.mdpkm.common:actions.delete')}
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Grid>
    </React.Fragment>;
};