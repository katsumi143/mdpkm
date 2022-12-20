import * as nbt from 'nbt-ts';
import { fetch } from '@tauri-apps/api/http';
import { Buffer } from 'buffer';
import { fileExists } from 'voxelified-commons/tauri';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';

import Modal from './Modal';
import Server from './Server';
import { Grid, Button, Spinner, TextInput, TextHeader, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import Patcher from '../../plugins/patcher';
import { useInstance } from '../../voxura';
export type ServerManagementProps = {
    instanceId: string
};
export default Patcher.register(function ServerManagement({ instanceId }: ServerManagementProps) {
    const { t } = useTranslation('interface');
    const instance = useInstance(instanceId);
    if (!instance)
        return;

    const [data, setData] = useState<any>();
    const [items, setItems] = useState<any>();
    const [filter, setFilter] = useState('');
    const [addingInfo, setAddingInfo] = useState<any>();
    const [addingName, setAddingName] = useState('');
    const [addingServer, setAddingServer] = useState(false);
    const [addingAddress, setAddingAddress] = useState('');
    const [addingAddress2, setAddingAddress2] = useState<string|null>();
    const resetAdding = () => {
        setAddingName('');
        setAddingAddress('');
        setAddingAddress2(null);
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
        writeBinaryFile(`${instance.path}/servers.dat`, [...new Uint8Array(nbt.encode('root', data))]);
    };
    useEffect(() => {
        if(!items) {
            if(!instance?.path)
                return;
            const path = `${instance.path}/servers.dat`;
            setData({});
            setItems('loading');
            fileExists(path).then(exists => {
                if (exists)
                    readBinaryFile(path).then(data => {
						const decoded = nbt.decode(Buffer.from(data));
						setData(decoded);
						setItems(decoded.value.servers);
					});
                else {
                    setData({});
                    setItems([]);
                }
            });
        }
    }, [items]);
    useEffect(() => {
        if (addingAddress2) {
            setAddingInfo('loading');
            fetch(`https://api.mcsrvstat.us/2/${encodeURIComponent(addingAddress2)}`).then(({ data }) => {
                setAddingInfo(data);
            }).catch(() => setAddingInfo(null));
        } else
            setAddingInfo(null);
    }, [addingAddress2]);
    useEffect(() => setItems(null), [instanceId]);
	console.log(data);
    return <React.Fragment>
        <Grid spacing={8} padding="4px 0" justifyContent="space-between">
            <Grid vertical>
                <Typography size={14} noSelect lineheight={1}>
                    {t('server_management')}
                </Typography>
                <Typography size={12} color="$secondaryColor" weight={400} noSelect>
                    {items === 'loading' || !items ?
                        t('app.mdpkm.common:states.loading') :
                        t('server_management.count', { count: items.length })
                    }
                </Typography>
            </Grid>
            <Grid spacing={8}>
                <TextInput
                    width={144}
                    value={filter}
                    onChange={setFilter}
                    placeholder={t('server_management.search')}
                />
                <Button theme="secondary" onClick={() => setItems(null)} disabled={items === 'loading'}>
                    {items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                    {t('common.action.refresh')}
                </Button>
                <Button theme="accent" onClick={openAdding} disabled={!data}>
                    <IconBiPlusLg/>
                    {t('server_management.add')}
                </Button>
            </Grid>
        </Grid>
        <Grid spacing={8} vertical>
            {Array.isArray(items) && items?.filter(({ ip, name }) =>
                ip?.toLowerCase().includes(filter) ||
                name?.toLowerCase().includes(filter)
            ).map((item, index) =>
                <Server
                    key={index}
                    name={item.name}
                    icon={item.icon}
                    address={item.ip}
                    instanceId={instanceId}
                    acceptTextures={item.acceptTextures?.value}
                />
            )}
        </Grid>
        {addingServer && <Modal>
            <TextHeader noSelect>
                {t('server_management.adding')}
                <Typography size={12} color="$secondaryColor" weight={400} noSelect>
                    {t('app.mdpkm.server_management.adding.header_note')}
                </Typography>
            </TextHeader>
            <Grid spacing={32} justifyContent="space-between">
                <Grid vertical>
                    <InputLabel>{t('server_management.adding.name')}</InputLabel>
                    <TextInput
                        value={addingName}
                        onChange={setAddingName}
                        placeholder={t('server.no_name')}
                    />

                    <InputLabel spacious>{t('server_management.adding.address')}</InputLabel>
                    <TextInput
                        value={addingAddress}
                        onBlur={() => setAddingAddress2(() => addingAddress)}
                        onChange={setAddingAddress}
                        placeholder={t('server_management.adding.address.placeholder')}
                    />
                    <Grid margin="2rem 0 0" spacing={8}>
                        <Button theme="accent" onClick={addServer} disabled={!addingAddress}>
                            <IconBiPlusLg/>
                            {t('server_management.adding')}
                        </Button>
                        <Button theme="secondary" onClick={closeAdding}>
                            <IconBiXLg/>
                            {t('common.action.cancel')}
                        </Button>
                    </Grid>
                </Grid>
                <Grid height="fit-content" spacing={16} alignItems="center">
                    {addingInfo === 'loading' && <Spinner/>}
                    <Server
                        name={addingName}
                        icon={addingInfo?.icon}
                        motd={addingInfo?.motd?.html?.join('</br>')}
                        type={addingInfo ? `${addingInfo?.software ?? ''} ${addingInfo?.version ?? ''}` : undefined}
                        players={addingInfo?.players}
                        address={addingAddress}
                    />
                </Grid>
            </Grid>
        </Modal>}
    </React.Fragment>;
});