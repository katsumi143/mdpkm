import * as nbt from 'nbt-ts';
import { fetch } from '@tauri-apps/api/http';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { exists, readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';
import { Grid, Button, Spinner, TextInput, TextHeader, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import Modal from '../../Modal';
import ServerItem from './item';

import type { Instance } from '../../../../../voxura';
export interface MinecraftServersProps {
    instance: Instance
}
export default function MinecraftServers({ instance }: MinecraftServersProps) {
	const path = instance.path + '/servers.dat';

    const { t } = useTranslation('interface');
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
        writeBinaryFile(path, [...new Uint8Array(nbt.encode('root', data))]);
    };
    useEffect(() => {
        if(!items) {
            if(!instance?.path)
                return;
            setData({});
            setItems('loading');
            exists(path).then(exists => {
                if (exists)
                    readBinaryFile(path).then(data => {
						const decoded: any = nbt.decode(Buffer.from(data));
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
    useEffect(() => setItems(null), [instance.id]);

    return <React.Fragment>
        <Grid margin="4px 0" justifyContent="space-between">
            <Grid vertical>
                <Typography size={14} noSelect lineheight={1}>
                    {t('servers')}
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
                    placeholder={t('servers.filter')}
                />
                <Button theme="secondary" onClick={() => setItems(null)} disabled={items === 'loading'}>
                    {items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                    {t('common.action.refresh')}
                </Button>
            </Grid>
        </Grid>
        <Grid spacing={8} vertical borderRadius={16} css={{ overflow: 'hidden auto' }}>
            {Array.isArray(items) && items?.filter(({ ip, name, hidden }) =>
				!hidden?.value &&
                (ip?.toLowerCase().includes(filter) ||
                name?.toLowerCase().includes(filter))
            ).map((item, index) =>
                <ServerItem
                    key={index}
                    name={item.name}
                    icon={item.icon}
                    address={item.ip}
                    instance={instance}
                    acceptTextures={item.acceptTextures?.value}
                />
            )}
        </Grid>
		<Grid margin="auto 0 16px">
			<Button theme="accent" onClick={openAdding} disabled={!data}>
				<IconBiPlusLg/>
				{t('servers.add')}
			</Button>
		</Grid>
        {addingServer && <Modal width="60%">
            <TextHeader noSelect>
                {t('servers.add')}
            </TextHeader>
            <Grid spacing={32} justifyContent="space-between">
                <Grid width="100%" vertical>
                    <InputLabel>{t('common.label.display_name')}</InputLabel>
                    <TextInput
						width="100%"
                        value={addingName}
                        onChange={setAddingName}
                        placeholder={t('server.no_name')}
                    />

                    <InputLabel spacious>{t('servers.add.address')}</InputLabel>
                    <TextInput
						width="100%"
                        value={addingAddress}
                        onBlur={() => setAddingAddress2(() => addingAddress)}
                        onChange={setAddingAddress}
                        placeholder={t('servers.add.address.placeholder')}
                    />
                    <Grid margin="2rem 0 0" spacing={8}>
                        <Button theme="accent" onClick={addServer} disabled={!addingAddress}>
                            <IconBiPlusLg/>
                            {t('servers.add')}
                        </Button>
                        <Button theme="secondary" onClick={closeAdding}>
                            <IconBiXLg/>
                            {t('common.action.cancel')}
                        </Button>
                    </Grid>
                </Grid>
                <Grid height="fit-content" spacing={16} alignItems="center">
                    {addingInfo === 'loading' && <Spinner/>}
                    <ServerItem
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
}