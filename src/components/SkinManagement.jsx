import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/dialog';
import { Buffer } from 'buffer/';
import { useTranslation } from 'react-i18next';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { useDispatch, useSelector } from 'react-redux';
import { XLg, PlusLg, PencilFill, Folder2Open } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Portal from '/voxeliface/components/Portal';
import Divider from '/voxeliface/components/Divider';
import Spinner from '/voxeliface/components/Spinner';
import Markdown from '/voxeliface/components/Markdown';
import SkinFrame from './SkinFrame';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import InputLabel from '/voxeliface/components/Input/Label';
import TextHeader from '/voxeliface/components/Typography/Header';
import * as Select from '/voxeliface/components/Input/Select';
import * as Tooltip from '/voxeliface/components/Tooltip';

import API from '../common/api';
import Util from '../common/util';
import Patcher from '../common/plugins/patcher';
import { addSkin, saveSkins } from '../common/slices/skins';
import { saveAccounts, writeAccount } from '../common/slices/accounts';

const SKIN_MODEL = { CLASSIC: 'default', SLIM: 'slim' };
export default Patcher.register(function SkinManagement() {
    const { t } = useTranslation();
    const skins = useSelector(state => state.skins.data);
    const account = Util.getAccount(useSelector);
    const dispatch = useDispatch();
    const [capes, setCapes] = useState([]);
    const [adding, setAdding] = useState(false);
    const [profile, setProfile] = useState();
    const [current, setCurrent] = useState();
    const [loading, setLoading] = useState(false);
    const [setting, setSetting] = useState(false);
    const [skinModel, setSkinModel] = useState();
    const [addingCape, setAddingCape] = useState();
    const [addingName, setAddingName] = useState('');
    const [addingPath, setAddingPath] = useState('');
    const [addingModel, setAddingModel] = useState('CLASSIC');
    const selectFile = () => open({
        filters: [{ name: 'PNG Image', extensions: ['png'] }]
    }).then(setAddingPath);
    const addNewSkin = async() => {
        const data = addingPath ? await Util.readBinaryFile(addingPath) : await fetch(
            `/img/skins/${addingModel}.png`
        ).then(r => r.arrayBuffer()).then(v => [...new Uint8Array(v)]);
        dispatch(addSkin({
            name: addingName,
            cape: addingCape,
            image: Buffer.from(data).toString('base64'),
            variant: addingModel
        }));
        dispatch(saveSkins());
        setAdding(false);
        setAddingCape();
        setAddingName('');
        setAddingPath('');
        setAddingModel('CLASSIC');
    };
    const useSkin = async key => {
        const skin = skins[key];
        if (skin) {
            setSetting(true);
            try {
                await API.Minecraft.uploadSkin(account.minecraft, [...new Uint8Array(Buffer.from(skin.image, 'base64').buffer)], skin.variant);
                await API.Minecraft.setCape(account.minecraft, skin.cape);
                setProfile();
            } catch(err) {
                setSetting(false);
                return toast.error('An unknown error occured.\nCheck your internet connection.');
            }
            setSetting(false);
            toast.success(`Your skin uploaded successfully!`);
        }
    };
    useEffect(() => {
        if (!profile && !loading) {
            setLoading(true);
            API.Minecraft.verifyAccount(account).then(async([verifiedAccount, changed]) => {
                if(changed) {
                    dispatch(writeAccount(verifiedAccount));
                    dispatch(saveAccounts());
                }
                const profile = await API.Minecraft.getProfile(verifiedAccount.minecraft, true);
                setProfile(profile);

                const skin = profile.skins.find(s => s.state === 'ACTIVE');
                const data = await API.makeRequest(skin?.url.replace(/^http/, 'https'), {
                    responseType: 'Binary'
                });
                const capes = [];
                for (const cape of profile.capes)
                    capes.push({
                        ...cape,
                        url: `data:image/png;base64,${Buffer.from(await API.makeRequest(
                            cape.url.replace(/^http/, 'https'), {
                                responseType: 'Binary'
                            }
                        )).toString('base64')}`
                    });
                setCapes(capes);
                setCurrent(Buffer.from(data).toString('base64'));
                setSkinModel(SKIN_MODEL[skin?.variant]);
                setLoading(false);
            }).catch(err => {
                console.warn(err);
                setLoading(false);
                toast.error('Failed to load profile');
            });
        }
    }, [profile, account]);
    return <Grid height="100%" spacing={8} padding=".75rem 1rem" direction="vertical">
        <TextHeader>
            {t('app.mdpkm.home.navigation.skins')}
        </TextHeader>
        <Grid height="100%">
            <Grid padding="0 0 2rem" direction="vertical" alignItems="center" justifyContent="space-between">
                <Grid spacing="1rem" direction="vertical" alignItems="center">
                    <Typography color="$primaryColor" family="Nunito">
                        {t('app.mdpkm.skin_management.current.header')}
                    </Typography>
                    {!loading && current ? <SkinFrame
                        walk
                        zoom
                        skin={`data:image/png;base64,${current}`}
                        cape={capes.find(c => c.state === 'ACTIVE')?.url}
                        width={200}
                        model={skinModel}
                        height={256}
                        control
                        background="none"
                    /> : <Grid width={200} height={256} alignItems="center" justifyContent="center">
                        <Spinner/>
                    </Grid>}
                </Grid>
                <Button theme="accent" onClick={() => setAdding(true)} disabled={loading}>
                    <PlusLg size={14}/>
                    {t('app.mdpkm.skin_management.buttons.add_skin')}
                </Button>
            </Grid>
            <Divider width={1} height="100%"/>
            <Grid width="100%" height="100%" direction="vertical" alignItems="center">
                <Typography color="$primaryColor" family="Nunito" margin="0 0 1rem">
                    {t('app.mdpkm.skin_management.library.header')}
                </Typography>
                {skins.length > 0 ? <Grid spacing={8} css={{
                    display: 'grid',
                    overflow: 'hidden auto',
                    gridTemplateColumns: 'repeat(5, 1fr)'
                }}>
                    {skins.map((skin, key) =>
                        <Skin key={key} data={skin} capes={capes} index={key} useSkin={useSkin} loading={loading || setting} current={current}/>
                    )}
                </Grid> : <React.Fragment>
                    <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                        {t('app.mdpkm.common:headers.empty_list')}
                    </Typography>
                    <Markdown text={t('app.mdpkm.skin_management.library.empty')} css={{
                        '& > :first-child': { color: '$secondaryColor' }
                    }}/>
                </React.Fragment>}
            </Grid>
        </Grid>
        {adding && <Portal>
            <Grid width="100vw" height="100vh" direction="vertical" alignItems="center" background="#00000099" justifyContent="center" css={{
                top: 0,
                left: 0,
                zIndex: 100000,
                position: 'absolute'
            }}>
                <Grid padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                    border: '1px solid $secondaryBorder2',
                    minWidth: '24rem',
                    position: 'relative'
                }}>
                    <TextHeader>{t('app.mdpkm.skin_management.adding.header')}</TextHeader>
                    <Grid spacing="2rem" justifyContent="space-between">
                        <SkinFrame
                            walk
                            skin={addingPath ? convertFileSrc(addingPath) : `img/skins/${addingModel}.png`}
                            cape={capes.find(c => c.id === addingCape)?.url}
                            width={150}
                            model={SKIN_MODEL[addingModel]}
                            height={256}
                            control
                            background="none"
                        />
                        <Grid direction="vertical">
                            <InputLabel>{t('app.mdpkm.skin_management.skin_name.label')}</InputLabel>
                            <TextInput
                                width="100%"
                                value={addingName}
                                onChange={setAddingName}
                                placeholder={t('app.mdpkm.skin_management.skin_name.placeholder')}
                            />

                            <InputLabel spacious>{t('app.mdpkm.skin_management.skin_model.label')}</InputLabel>
                            <Select.Root value={addingModel} onChange={setAddingModel}>
                                <Select.Group name={t('app.mdpkm.skin_management.skin_model.category')}>
                                    <Select.Item value="CLASSIC">
                                        {t('app.mdpkm.skin_management.skin_model.items.classic')}
                                    </Select.Item>
                                    <Select.Item value="SLIM">
                                        {t('app.mdpkm.skin_management.skin_model.items.slim')}
                                    </Select.Item>
                                </Select.Group>
                            </Select.Root>

                            <InputLabel spacious>{t('app.mdpkm.skin_management.skin_file.label')}</InputLabel>
                            <TextInput
                                width="100%"
                                value={addingPath && `.../${addingPath.split('\\').slice(-2).join('/')}`}
                                readOnly
                                placeholder={t('app.mdpkm.import_instance.select_file.placeholder')}
                            >
                                <Button onClick={selectFile}>
                                    <Folder2Open size={14}/>
                                    {t('app.mdpkm.common:actions.select_file')}
                                </Button>
                            </TextInput>

                            <InputLabel spacious>{t('app.mdpkm.skin_management.cape.label')}</InputLabel>
                            <Select.Root value={addingCape} onChange={setAddingCape} defaultValue="none">
                                <Select.Group name={t('app.mdpkm.skin_management.cape.category')}>
                                    {capes.map((cape, key) => <Select.Item key={key} value={cape.id}>
                                        <Image src={cape.url} size={24} height={32} css={{
                                            backgroundSize: '128px 66px',
                                            imageRendering: 'pixelated',
                                            backgroundColor: '#fff',
                                            backgroundPosition: '0 7%'
                                        }}/>
                                        {cape.alias}
                                    </Select.Item>)}
                                </Select.Group>
                                <Select.Item value="none">
                                    {t('app.mdpkm.skin_management.cape.items.none')}
                                </Select.Item>
                            </Select.Root>

                            <Grid margin="2rem 0 0" spacing={8}>
                                <Button theme="accent" onClick={addNewSkin} disabled={!addingName}>
                                    <PlusLg size={14}/>
                                    {t('app.mdpkm.skin_management.adding.submit')}
                                </Button>
                                <Button theme="secondary" onClick={() => setAdding(false)}>
                                    <XLg/>
                                    {t('app.mdpkm.skin_management.adding.cancel')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Portal>}
    </Grid>;
});

function Skin({ data, capes, index, useSkin, loading, current }) {
    const { t } = useTranslation();
    return <Grid padding={8} spacing={4} direction="vertical" alignItems="center" background="$primaryBackground" borderRadius="8px" justifyContent="space-between" css={{
        border: '$secondaryBorder solid 1px'
    }}>
        <Typography color="$primaryColor" family="Nunito">
            {data.name}
        </Typography>
        {loading ? <Grid width={100} height={128} alignItems="center" justifyContent="center">
            <Spinner/>
        </Grid> : <SkinFrame
            skin={`data:image/png;base64,${data.image}`}
            cape={capes?.find(c => c.id === data.cape)?.url}
            width={100}
            model={SKIN_MODEL[data.variant]}
            height={128}
            stillWalk
            background="none"
        />}
        <Grid spacing={8}>
            <Button size="smaller" theme="accent" onClick={() => useSkin(index)} disabled={loading || current === data.image}>
                {t('app.mdpkm.common:actions.use')}
            </Button>
            <Tooltip.Root delayDuration={250}>
                <Tooltip.Trigger asChild>
                    <Button size="smaller" theme="secondary" disabled>
                        <PencilFill/>
                        {t('app.mdpkm.common:actions.edit')}
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content side="top" sideOffset={4}>
                    <Tooltip.Arrow/>
                    {t('app.mdpkm.common:tooltips.feature_unavailable')}
                </Tooltip.Content>
            </Tooltip.Root>
        </Grid>
    </Grid>;
};