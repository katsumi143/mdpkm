import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { open } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Folder2Open } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import * as Select from '/voxeliface/components/Input/Select';
import InstanceIcon from './InstanceIcon';

import API from '../common/api';
import Util from '../common/util';
import Patcher from '/src/common/plugins/patcher';
import Instances from '../common/instances';
export default Patcher.register(function ImportInstance({ path: epath, back }) {
    const { t } = useTranslation();
    const instances = useSelector(state => state.instances.data);

    const [name, setName] = useState('');
    const [path, setPath] = useState(epath);
    const [data, setData] = useState();
    const [inherit, setInherit] = useState('noinherit');
    const [sourceImg, setSourceImg] = useState();
    const [importState, setImportState] = useState();
    const importInstance = () => {
        setImportState('Starting import...');
        Instances.importInstance(name, path, inherit).then(() => {
            setImportState();
            back();
        }).catch(err => {
            console.error(err);
            toast.error(`Import Failed!\n${err.message ?? 'Unknown Reason.'}`);
            setImportState();
            back();
        });
    };
    const selectFile = async() =>
        open({
            filters: [{ name: 'Instance Files', extensions: ['mdpki', 'mrpack', 'zip'] }]
        }).then(path => {
            setPath(path);
            setData();
        });
    const readFile = async() => {
        setSourceImg();
        await Util.readFileInZip(path, 'export_data.json').then(JSON.parse).then(async manifest => {
            manifest.icon = await Util.readFileInZipBase64(path, 'icon.').catch(console.warn);
            manifest.iconType = {
                i: 'png',
                R: 'gif',
                P: 'svg+xml',
                '/': 'jpeg'
            }[manifest.icon?.charAt(0)];
            manifest.config = await Util.readFileInZip(path, 'config.json').then(JSON.parse);

            setName(manifest.name ?? '');
            setData(manifest);
            setPath(path);
        }).catch(console.warn);
        //TODO: why why why why why why
        await Util.readFileInZip(path, 'modrinth.index.json').then(JSON.parse).then(async manifest => {
            const modrinth = API.get('modrinth');
            manifest.icon = await Util.readFileBase64(`${Util.tempPath}/${manifest.name}.png`).catch(console.warn);
            manifest.iconType = 'png';
            manifest.config = {
                loader: modrinth.convertFormatDependencies(manifest.dependencies)
            };

            setSourceImg('img/banners/modrinth.svg');
            setName(manifest.name ?? '');
            setData(manifest);
            setPath(path);
        }).catch(console.warn);
        await Util.readFileInZip(path, 'manifest.json').then(JSON.parse).then(async manifest => {
            manifest.icon = await Util.readFileBase64(`${Util.tempPath}/${manifest.name}.png`).catch(console.warn);
            manifest.iconType = 'png';
            
            const loader = manifest.minecraft.modLoaders.find(m => m.primary).id.split('-');
            manifest.config = {
                loader: {
                    game: manifest.minecraft.version,
                    type: loader[0],
                    version: loader[1]
                }
            };

            setSourceImg('img/banners/curseforge.svg');
            setName(manifest.name ?? '');
            setData(manifest);
            setPath(path);
        }).catch(console.warn);
    };
    useEffect(() => {
        if (path && !data)
            readFile();
    }, [path]);
    return (
        <Grid width="100%" direction="vertical" alignItems="center">
            <Grid width="100%" padding="1rem 0" spacing={8} direction="vertical" alignItems="center" css={{
                borderBottom: '1px solid $tagBorder'
            }}>
                <Typography size="1.2rem" color="$primaryColor" family="Raleway" lineheight={1}>
                    {t('app.mdpkm.common:headers.adding_instance')}
                </Typography>
                <Typography size=".9rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                    {t('app.mdpkm.import_instance.title')}
                </Typography>
            </Grid>
            <Grid width="fit-content" height="-webkit-fill-available" spacing="1rem" padding="2rem 0" direction="vertical" alignItems="center" css={{
                overflow: 'auto'
            }}>
                <Grid margin="0 0 8px" spacing={12} direction="vertical" alignItems="center">
                    {data && <Grid spacing={16} alignItems="center" justifyContent="center">
                        <Image src={`data:image/${data.iconType};base64,${data.icon}`} size={48} background="$secondaryBackground" borderRadius={4} css={{
                            minWidth: 64,
                            minHeight: 64,
                            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                            '&:hover': {
                                minWidth: 86,
                                minHeight: 86
                            }
                        }}/>
                        <Grid spacing={4} direction="vertical" justifyContent="center">
                            <Typography size="1.1rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                {data.name}
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                {!data.config.loader && "Couldn't read config.json"}{t(`app.mdpkm.common:loaders.${data.config.loader?.type}`)} {data.config.loader?.version} {data.config.loader?.game}
                            </Typography>
                        </Grid>
                    </Grid>}
                    {sourceImg && <Image src={sourceImg} size="3rem" width="10rem"/>}
                </Grid>
                {!epath && <Grid spacing={4} direction="vertical">
                    <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                        {t('app.mdpkm.import_instance.select_file')}
                    </Typography>
                    <TextInput
                        width={320}
                        value={path && `.../${path.split('\\').slice(-2).join('/')}`}
                        readOnly
                        disabled={!!importState}
                        placeholder={t('app.mdpkm.import_instance.select_file.placeholder')}
                    >
                        <Button onClick={selectFile} disabled={!!importState}>
                            <Folder2Open size={14}/>
                            {t('app.mdpkm.common:actions.select_file')}
                        </Button>
                    </TextInput>
                </Grid>}
                {data && <React.Fragment>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            {t('app.mdpkm.import_instance.name_instance')}
                        </Typography>
                        <TextInput
                            width={320}
                            value={name}
                            onChange={setName}
                            disabled={!!importState}
                        />
                    </Grid>
                    <Grid spacing={4} direction="vertical" css={{ width: 320 }}>
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            {t('app.mdpkm.import_instance.inherit_config')}
                        </Typography>
                        <Select.Root value={inherit} onChange={setInherit} disabled={!!importState}>
                            <Select.Item value="noinherit">
                                {t('app.mdpkm.import_instance.inherit_config.items.none')}
                            </Select.Item>
                            <Select.Group name={t('app.mdpkm.import_instance.inherit_config.category')}>
                                {instances.map((instance, index) =>
                                    <Select.Item key={index} value={index}>
                                        <InstanceIcon size={24} instance={instance} hideLoader/>
                                        {instance.name}
                                    </Select.Item>
                                )}
                            </Select.Group>
                        </Select.Root>
                    </Grid>
                </React.Fragment>}
            </Grid>
            <Grid width="100%" padding={16} justifyContent="space-between" css={{
                borderTop: `1px solid $tagBorder`
            }}>
                {importState ?
                    <Typography size="1.1rem" color="$primaryColor" weight={600} family="Nunito">
                        {importState}
                    </Typography>
                :
                    <Button theme="secondary" onClick={back}>
                        <ArrowLeft size={14}/>
                        {t('app.mdpkm.common:buttons.back_to_selection')}
                    </Button>
                }
                <Grid spacing={8}>
                    <Button theme="accent" onClick={importInstance} disabled={!data || !!importState}>
                        {t('app.mdpkm.import_instance.buttons.import')}
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
});