import React, { useState, useEffect } from 'react';
import nbt from 'nbt';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { XLg, PlusLg, ArrowClockwise } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Server from './Server';
import Button from '/voxeliface/components/Button';
import Portal from '/voxeliface/components/Portal';
import Header from '/voxeliface/components/Typography/Header';
import Spinner from '/voxeliface/components/Spinner';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import InputLabel from '/voxeliface/components/Input/Label';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';

import Util from '../common/util';
export default function ServerManagement({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const [data, setData] = useState();
    const [items, setItems] = useState();
    const [filter, setFilter] = useState('');
    const [addingInfo, setAddingInfo] = useState();
    const [addingName, setAddingName] = useState('');
    const [addingServer, setAddingServer] = useState();
    const [addingAddress, setAddingAddress] = useState('');
    const [addingAddress2, setAddingAddress2] = useState();
    const resetAdding = () => {
        setAddingName('');
        setAddingAddress('');
        setAddingAddress2();
    };
    const closeAdding = () => {
        resetAdding();
        setAddingServer(false);
    };
    const openAdding = () => {
        resetAdding();
        setAddingServer(true);
    };
    const addServer = () => {
        closeAdding();
        data.value.servers.value.value.push({
            ip: { type: 'string', value: addingAddress },
            name: { type: 'string', value: addingName || 'Minecraft Server' },
            icon: { type: 'string', value: addingInfo?.icon?.replace?.('data:image/png;base64,', '') }
        });
        setData(data);
        setItems(data.value.servers.value.value);
        console.log([...new Uint8Array(nbt.writeUncompressed(data))]);
        Util.writeBinaryFile(`${instance.path}/servers.dat`, [...new Uint8Array(nbt.writeUncompressed(data))]);
    };
    useEffect(() => {
        if(!items) {
            if(!instance?.path)
                return;
            const path = `${instance.path}/servers.dat`;
            setData();
            setItems('loading');
            Util.fileExists(path).then(exists => {
                if (exists)
                    Util.readBinaryFile(path).then(data => nbt.parse(data, (error, data) => {
                        if(error) throw error;
                        setData(data);
                        setItems(data.value.servers.value.value);
                    }));
                else {
                    setData();
                    setItems([]);
                }
            });
        }
    }, [items]);
    useEffect(() => {
        if (addingAddress2) {
            setAddingInfo('loading');
            Util.makeRequest(`https://api.mcsrvstat.us/2/${encodeURIComponent(addingAddress2)}`).then(data => {
                setAddingInfo(data);
            }).catch(() => setAddingInfo());
        } else
            setAddingInfo();
    }, [addingAddress2]);
    useEffect(() => setItems(), [instanceId]);
    console.log(data, addingInfo);
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
                <Button theme="accent" onClick={openAdding} disabled={!data}>
                    <PlusLg size={14}/>
                    {t('app.mdpkm.server_management.add')}
                </Button>
            </Grid>
        </Grid>
        <Grid spacing={8} direction="vertical">
            {Array.isArray(items) && items?.filter(({ ip, name }) =>
                ip?.value.toLowerCase().includes(filter) ||
                name?.value.toLowerCase().includes(filter)
            ).map((item, index) =>
                <Server
                    key={index}
                    name={item.name?.value}
                    icon={item.icon?.value}
                    address={item.ip?.value}
                    instanceId={instanceId}
                    acceptTextures={item.acceptTextures?.value}
                />
            )}
        </Grid>
        {addingServer && <Portal>
            <Grid width="100vw" height="100vh" direction="vertical" alignItems="center" background="#00000099" justifyContent="center" css={{
                top: 0,
                left: 0,
                zIndex: 100000,
                position: 'absolute'
            }}>
                <Grid padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                    border: '1px solid $secondaryBorder2',
                    position: 'relative'
                }}>
                    <Header>
                        Adding Minecraft Server
                        <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
                            (may not appear if game is running)
                        </Typography>
                    </Header>
                    <Grid spacing="2rem" justifyContent="space-between">
                        <Grid direction="vertical">
                            <InputLabel>Display name</InputLabel>
                            <TextInput
                                value={addingName}
                                onChange={setAddingName}
                                placeholder="Type a name"
                            />

                            <InputLabel spacious>Server address</InputLabel>
                            <TextInput
                                value={addingAddress}
                                onBlur={() => setAddingAddress2(() => addingAddress)}
                                onChange={setAddingAddress}
                                placeholder="Type an IP Address"
                            />
                            <Grid margin="2rem 0 0" spacing={8}>
                                <Button theme="accent" onClick={addServer} disabled={!addingAddress}>
                                    <PlusLg size={14}/>
                                    Add Server
                                </Button>
                                <Button theme="secondary" onClick={closeAdding}>
                                    <XLg/>
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid height="fit-content" spacing="1rem" alignItems="center">
                            {addingInfo === 'loading' && <Spinner/>}
                            <Server
                                name={addingName}
                                icon={addingInfo?.icon}
                                motd={addingInfo?.motd?.html?.join('</br>')}
                                type={addingInfo ? `${addingInfo?.software ?? ''} ${addingInfo?.version ?? ''}` : null}
                                players={addingInfo?.players}
                                address={addingAddress}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Portal>}
    </React.Fragment>;
};