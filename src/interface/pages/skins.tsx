import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { readBinaryFile } from '@tauri-apps/api/fs';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { fetch } from '@tauri-apps/api/http';
import React, { useState, useEffect } from 'react';

import Modal from '../components/Modal';
import SkinFrame from '../components/SkinFrame';
import FileSelect from '../components/FileSelect';
import { Grid, Image, Select, Button, Divider, Spinner, Markdown, TextInput, Typography, InputLabel, TextHeader } from 'voxeliface';

import { useCurrentAccount } from '../../voxura';
import { addSkin, saveSkins, writeSkin } from '../../store/slices/skins';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast, getSkinData, getCapeData } from '../../util';
import { ProfileType, MinecraftCape, MinecraftProfile } from '../../../voxura';

const SKIN_MODEL = { CLASSIC: 'default', SLIM: 'slim' } as const;
export default function Skins() {
    const { t } = useTranslation('interface');
    const skins = useAppSelector(state => state.skins.data);
    const account = useCurrentAccount();
    const dispatch = useAppDispatch();
    const [capes, setCapes] = useState<any[]>([]);
    const [adding, setAdding] = useState(false);
    const [profile, setProfile] = useState<MinecraftProfile | null>(null);
    const [current, setCurrent] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [setting, setSetting] = useState(false);
    const [skinModel, setSkinModel] = useState();
    const [addingName, setAddingName] = useState('');
    const [addingPath, setAddingPath] = useState('');
    const [addingCape, setAddingCape] = useState<string | null>(null);
    const [editingSkin, setEditingSkin] = useState<number | null>();
    const [addingModel, setAddingModel] = useState<'CLASSIC' | 'SLIM'>('CLASSIC');
    const startAdding = () => {
        setAdding(true);
        setAddingName('');
        setAddingPath('');
        setAddingCape(null);
        setAddingModel('CLASSIC');
    };
    const addNewSkin = async() => {
        const data = addingPath ? await readBinaryFile(addingPath) : await fetch(
            `/img/skins/${addingModel}.png`
        ).then(r => r.arrayBuffer()).then(v => [...new Uint8Array(v)]);
        dispatch(addSkin({
            name: addingName,
            cape: addingCape,
            image: Buffer.from(data).toString('base64'),
            variant: addingModel
        }));
        dispatch(saveSkins());
        toast('Skin saved', `Saved '${addingName}' successfully.`);

        setAdding(false);
        setAddingName('');
        setAddingPath('');
        setAddingCape(null);
        setAddingModel('CLASSIC');
    };
    const saveSkin = async() => {
        const skin = skins[editingSkin!];
        if (skin) {
            dispatch(writeSkin([editingSkin, {
                name: addingName,
                cape: addingCape,
                image: addingPath.startsWith('data:') ? skin.image : Buffer.from(await readBinaryFile(addingPath)).toString('base64'),
                variant: addingModel
            }]));
            dispatch(saveSkins());
            setAddingName('');
            setAddingPath('');
            setAddingCape(null);
            setEditingSkin(null);
            setAddingModel('CLASSIC');
            toast('Skin saved', `Saved changes to '${skin.name}' successfully.`);
        }
    };
    const editSkin = (key: number) => {
        const skin = skins[key];
        if (skin) {
            setAddingName(skin.name);
            setAddingCape(skin.cape);
            setAddingPath(`data:image/png;base64,${skin.image}`);
            setEditingSkin(key);
            setAddingModel(skin.variant);
        }
    };
    const useSkin = (key: number) => {
        const skin = skins[key];
        if (skin) {
            setSetting(true);
            account!.changeSkin(new Uint8Array(Buffer.from(skin.image, 'base64').buffer), skin.variant).then(() =>
                account!.changeCape(skin.cape)
            ).then(async(profile) => {
                toast('Skin saved', `Your skin uploaded successfully!`);
				const skin = profile.skins.find(s => s.state === 'ACTIVE')!;
				const capes: MinecraftCape[] = [];
                for (const cape of profile.capes)
                    capes.push({
                        ...cape,
                        url: await getCapeData(cape)
                    });

				setCapes(capes);
                setProfile(profile);
				getSkinData(skin).then(data => setCurrent(Buffer.from(data).toString('base64')));
				setSkinModel(SKIN_MODEL[skin.variant]);
            }).catch(err => {
                toast('Unexpected error', 'Check your internet connection.');
                throw err;
            }).then(() => setSetting(false));
        }
    };
    useEffect(() => {
        if (account && !profile && !loading) {
            setLoading(true);
            account.refresh().then(async() => {
                const profile: MinecraftProfile = await account.getProfile(ProfileType.Minecraft);
                const skin = profile.skins.find(s => s.state === 'ACTIVE')!;
                const capes: MinecraftCape[] = [];
                for (const cape of profile.capes)
                    capes.push({
                        ...cape,
                        url: await getCapeData(cape)
                    });

                setCapes(capes);
                setProfile(profile);
                getSkinData(skin).then(data => setCurrent(Buffer.from(data).toString('base64')));
                setSkinModel(SKIN_MODEL[skin.variant]);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                toast('Unexpected error', 'Failed to load profile.');

                setLoading(false);
                setCurrent('img/skins/CLASSIC.png');
            });
        }
    }, [profile, account]);
    return <Grid height="100%" spacing={8} padding=".75rem 1rem" vertical>
        <TextHeader noSelect>
            {t('skin_management')}
        </TextHeader>
        <Grid height="100%">
            <Grid padding="0 32px 2rem" vertical alignItems="center" justifyContent="space-between">
                <Grid spacing={16} vertical alignItems="center">
                    <Typography size={18} noSelect>
                        {t('skin_management.current')}
                    </Typography>
                    {!loading && current ? <SkinFrame
                        walk
                        zoom
                        skin={current.startsWith('img') ? current : `data:image/png;base64,${current}`}
                        cape={capes.find(c => c.state === 'ACTIVE')?.url}
                        width={200}
                        model={skinModel}
                        height={300}
                        control
                        background="none"
						css={{
							overflow: 'hidden',
							borderRadius: 16
						}}
                    /> : <Grid width={200} height={300} alignItems="center" justifyContent="center">
                        <Spinner/>
                    </Grid>}
                </Grid>
                <Button theme="accent" onClick={startAdding} disabled={loading}>
                    <IconBiPlusLg/>
                    {t('skin_management.add')}
                </Button>
            </Grid>
            <Divider width={1} height="100%"/>
            <Grid width="100%" height="100%" vertical alignItems="center">
                <Typography size={18} margin="0 0 1rem" noSelect>
                    {t('skin_management.library')}
                </Typography>
                {skins.length > 0 ? <Grid spacing={8} css={{
                    display: 'grid',
                    overflow: 'hidden auto',
                    gridTemplateColumns: 'repeat(6, auto)'
                }}>
                    {skins.map((skin: any, key: number) =>
                        <Skin key={key} data={skin} capes={capes} index={key} useSkin={useSkin} editSkin={editSkin} loading={loading || setting} current={current}/>
                    )}
                </Grid> : <React.Fragment>
                    <Typography size="1.2rem" family="$primarySans">
                        {t('app.mdpkm.common:headers.empty_list')}
                    </Typography>
                    <Markdown text={t('app.mdpkm.skin_management.library.empty')} css={{
                        '& > :first-child': { color: '$secondaryColor' }
                    }}/>
                </React.Fragment>}
            </Grid>
        </Grid>
        {adding && <Modal>
            <TextHeader>{t('skin_management.add')}</TextHeader>
            <Grid spacing={32} justifyContent="space-between">
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
                <Grid vertical>
                    <InputLabel>{t('skin_management.add_modal.name')}</InputLabel>
                    <TextInput
                        width="100%"
                        value={addingName}
                        onChange={setAddingName}
                        placeholder={t('skin_management.add_modal.name.placeholder')}
                    />

                    <InputLabel spacious>{t('skin_management.add_modal.model')}</InputLabel>
                    <Select.Minimal value={addingModel} onChange={setAddingModel}>
                        <Select.Group name={t('skin_management.add_modal.model.category')}>
                            <Select.Item value="CLASSIC">
                                {t('skin_management.add_modal.model.item.classic')}
                            </Select.Item>
                            <Select.Item value="SLIM">
                                {t('skin_management.add_modal.model.item.slim')}
                            </Select.Item>
                        </Select.Group>
                    </Select.Minimal>

                    <InputLabel spacious>{t('skin_management.add_modal.file')}</InputLabel>
					<FileSelect name={t('skin_management.ext_name')} path={addingPath} setPath={setAddingPath} extensions={['png']}/>

                    <InputLabel spacious>{t('skin_management.add_modal.cape')}</InputLabel>
                    <Select.Minimal value={addingCape} onChange={setAddingCape}>
                        <Select.Group name={t('skin_management.add_modal.cape.category')}>
                            {capes.map((cape, key) => <Select.Item key={key} value={cape.id}>
                                <Image src={cape.url} size={24} height={32} css={{
									background: '#fff',
                                    backgroundSize: '128px 66px',
                                    imageRendering: 'pixelated',
                                    backgroundPosition: '0 7%'
                                }}/>
                                {cape.alias}
                            </Select.Item>)}
                        </Select.Group>
                        <Select.Item value={null}>
                            {t('skin_management.add_modal.cape.item.none')}
                        </Select.Item>
                    </Select.Minimal>

                    <Grid margin="2rem 0 0 auto" spacing={8}>
                        <Button theme="accent" onClick={addNewSkin} disabled={!addingName}>
                            <IconBiPlusLg/>
                            {t('skin_management.add_modal.submit')}
                        </Button>
                        <Button theme="secondary" onClick={() => setAdding(false)}>
                            <IconBiXLg/>
                            {t('common.action.cancel')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Modal>}
        {typeof editingSkin === 'number' && <Modal>
            <TextHeader>{t('app.mdpkm.skin_management.editing.header', { val: skins[editingSkin]?.name })}</TextHeader>
            <Grid spacing={32} justifyContent="space-between">
                <SkinFrame
                    walk
                    skin={addingPath.startsWith('data:') ? addingPath : convertFileSrc(addingPath)}
                    cape={capes.find(c => c.id === addingCape)?.url}
                    width={150}
                    model={SKIN_MODEL[addingModel]}
                    height={256}
                    control
                    background="none"
                />
                <Grid vertical>
                    <InputLabel>{t('app.mdpkm.skin_management.skin_name.label')}</InputLabel>
                    <TextInput
                        width="100%"
                        value={addingName}
                        onChange={setAddingName}
                        placeholder={t('app.mdpkm.skin_management.skin_name.placeholder')}
                    />

                    <InputLabel spacious>{t('app.mdpkm.skin_management.skin_model.label')}</InputLabel>
                    <Select.Minimal value={addingModel} onChange={setAddingModel}>
                        <Select.Group name={t('app.mdpkm.skin_management.skin_model.category')}>
                            <Select.Item value="CLASSIC">
                                {t('app.mdpkm.skin_management.skin_model.items.classic')}
                            </Select.Item>
                            <Select.Item value="SLIM">
                                {t('app.mdpkm.skin_management.skin_model.items.slim')}
                            </Select.Item>
                        </Select.Group>
                    </Select.Minimal>

                    <InputLabel spacious>{t('app.mdpkm.skin_management.skin_file.label')}</InputLabel>
					<FileSelect name={t('skin_management.ext_name')} path={addingPath} setPath={setAddingPath} extensions={['png']}/>

                    <InputLabel spacious>{t('app.mdpkm.skin_management.cape.label')}</InputLabel>
                    <Select.Minimal value={addingCape} onChange={setAddingCape}>
                        <Select.Group name={t('app.mdpkm.skin_management.cape.category')}>
                            {capes.map((cape, key) => <Select.Item key={key} value={cape.id}>
                                <Image src={cape.url} size={24} height={32} css={{
									background: '#fff',
                                    backgroundSize: '128px 66px',
                                    imageRendering: 'pixelated',
                                    backgroundPosition: '0 7%'
                                }}/>
                                {cape.alias}
                            </Select.Item>)}
                        </Select.Group>
                        <Select.Item value={null}>
                            {t('app.mdpkm.skin_management.cape.items.none')}
                        </Select.Item>
                    </Select.Minimal>

                    <Grid margin="2rem 0 0" spacing={8}>
                        <Button theme="accent" onClick={saveSkin} disabled={!addingName}>
                            <IconBiPlusLg/>
                            {t('app.mdpkm.common:actions.save_changes')}
                        </Button>
                        <Button theme="secondary" onClick={() => setEditingSkin(false)}>
                            <IconBiXLg/>
                            {t('common.action.cancel')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Modal>}
    </Grid>;
};

export type SkinProps = {
    data: any,
    capes: any[],
    index: number,
    current: boolean,
    loading: boolean,
    useSkin: (value: number) => void,
    editSkin: (value: number) => void
};
function Skin({ data, capes, index, current, loading, useSkin, editSkin }: SkinProps) {
    const { t } = useTranslation('interface');
    return <Grid padding={8} spacing={4} vertical alignItems="center" background="$primaryBackground" borderRadius="8px" justifyContent="space-between" css={{
        border: '$secondaryBorder solid 1px'
    }}>
        <Typography noSelect>
            {data.name}
        </Typography>
        {loading ? <Grid width={100} height={128} alignItems="center" justifyContent="center">
            <Spinner/>
        </Grid> : <SkinFrame
            skin={`data:image/png;base64,${data.image}`}
            cape={capes?.find(c => c.id === data.cape)?.url}
            image
            width={100}
            model={SKIN_MODEL[data.variant]}
            height={128}
            stillWalk
            background="none"
        />}
        <Grid spacing={8}>
            <Button size="smaller" theme="accent" onClick={() => useSkin(index)} disabled={loading || current === data.image}>
                {t('common.action.use')}
            </Button>
            <Button size="smaller" theme="secondary" onClick={() => editSkin(index)} disabled={loading}>
                <IconBiPencilFill/>
                {t('common.action.edit')}
            </Button>
        </Grid>
    </Grid>;
};