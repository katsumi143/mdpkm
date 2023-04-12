import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { readBinaryFile } from '@tauri-apps/api/fs';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import React, { useState, useEffect } from 'react';
import { Grid, Image, Select, Button, Divider, Spinner, TextInput, Typography, InputLabel, TextHeader } from 'voxeliface';

import Modal from '../components/Modal';
import SkinFrame from '../components/SkinFrame';
import FileSelect from '../components/FileSelect';

import AlexSkin from '../../skins/alex.png?raw-base64';
import SteveSkin from '../../skins/steve.png?raw-base64';
import { useMinecraftAccount } from '../../voxura';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast, getSkinData, getCapeData } from '../../util';
import { Skin, addSkin, saveSkins, writeSkin } from '../../store/slices/skins';
import { MinecraftCape, MinecraftProfile } from '../../../voxura';

// TODO: rewrite
const SKIN_MODEL = { CLASSIC: 'default', SLIM: 'slim' } as const;

const textEncoder = new TextEncoder();
const MODEL_IMAGES = {
	SLIM: textEncoder.encode(AlexSkin),
	CLASSIC: textEncoder.encode(SteveSkin)
};
const MODEL_IMAGES_BASE64 = {
	SLIM: AlexSkin,
	CLASSIC: SteveSkin
};
export default function Skins() {
    const { t } = useTranslation('interface');
    const skins = useAppSelector(state => state.skins.data);
    const account = useMinecraftAccount();
    const dispatch = useAppDispatch();
    const [capes, setCapes] = useState<any[]>([]);
    const [adding, setAdding] = useState(false);
    const [profile, setProfile] = useState<MinecraftProfile | null>(null);
    const [current, setCurrent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [setting, setSetting] = useState(false);
    const [skinModel, setSkinModel] = useState<'slim' | 'default'>();
    const [addingName, setAddingName] = useState('');
    const [addingPath, setAddingPath] = useState('');
    const [addingCape, setAddingCape] = useState<string | null>(null);
    const [editingSkin, setEditingSkin] = useState<number | null>();
    const [addingModel, setAddingModel] = useState<'SLIM' | 'CLASSIC'>('CLASSIC');
    const startAdding = () => {
        setAdding(true);
        setAddingName('');
        setAddingPath('');
        setAddingCape(null);
        setAddingModel('CLASSIC');
    };
    const addNewSkin = async() => {
        const data = addingPath ? await readBinaryFile(addingPath) : MODEL_IMAGES[addingModel];
        dispatch(addSkin({
            name: addingName,
            cape: addingCape,
            image: Buffer.from(data).toString('base64'),
            variant: addingModel
        }));
        dispatch(saveSkins());
        toast('skin_saved', [addingName]);

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
			toast('skin_saved', [skin.name]);
        }
    };
    const editSkin = (key: number) => {
        const skin = skins[key];
        if (skin) {
            setAddingName(skin.name);
            setAddingCape(skin.cape ?? null);
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
            ).then(profile => {
				toast('skin_uploaded', [skin.name]);
				return profile;
			}).then(async(profile) => {
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
				toast('check_connection');
                throw err;
            }).then(() => setSetting(false));
        }
    };
    useEffect(() => {
        if (account && !profile && !loading) {
            setLoading(true);
            account.refresh().then(async() => {
                const profile: MinecraftProfile = await account.getProfile();
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
				setLoading(false);
                setCurrent(MODEL_IMAGES_BASE64.CLASSIC);
				toast('check_connection');

				throw err;
            });
        }
    }, [profile, account]);
    return <Grid height="100%" padding={32}>
        <Grid padding="24px 2rem 2rem" vertical alignItems="center" justifyContent="space-between">
			<Grid spacing={16} vertical alignItems="center">
				<Typography size={20} weight={600} family="$tertiary" noSelect>
					{t('skin_management.current')}
				</Typography>
				{!loading && current ? <SkinFrame
					walk
					slim={skinModel === 'slim'}
					skin={`data:image/png;base64,${current}`}
					cape={capes.find(c => c.state === 'ACTIVE')?.url}
					width={200}
					height={300}
					control
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
		<Grid width="100%" height="100%" padding="24px 0 0" spacing={16} vertical alignItems="center">
			<Typography size={20} weight={600} family="$tertiary" noSelect>
				{t('skin_management.library')}
			</Typography>
			<Grid spacing={8} css={{
				display: 'grid',
				overflow: 'hidden auto',
				gridTemplateColumns: 'repeat(6, auto)'
			}}>
				{skins.map((skin, key) =>
					<LibraryItem key={skin.name} data={skin} capes={capes} index={key} useSkin={useSkin} editSkin={editSkin} loading={loading || setting}/>
				)}
			</Grid>
		</Grid>
        {adding && <Modal>
            <TextHeader>{t('skin_management.add')}</TextHeader>
            <Grid spacing={32} justifyContent="space-between">
                <SkinFrame
                    walk
					slim={addingModel === 'SLIM'}
                    skin={addingPath ? convertFileSrc(addingPath) : `data:image/png;base64,${MODEL_IMAGES_BASE64[addingModel]}`}
                    cape={capes.find(c => c.id === addingCape)?.url}
                    width={150}
                    height={256}
                    control
                />
                <Grid vertical>
                    <InputLabel>{t('common.label.display_name')}</InputLabel>
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
					slim={addingModel === 'SLIM'}
                    skin={addingPath.startsWith('data:') ? addingPath : convertFileSrc(addingPath)}
                    cape={capes.find(c => c.id === addingCape)?.url}
                    width={150}
                    height={256}
                    control
                />
                <Grid vertical>
                    <InputLabel>{t('common.label.display_name')}</InputLabel>
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

                    <Grid margin="2rem 0 0" spacing={8}>
                        <Button theme="accent" onClick={saveSkin} disabled={!addingName}>
                            <IconBiPlusLg/>
                            {t('common.action.save_changes')}
                        </Button>
                        <Button theme="secondary" onClick={() => setEditingSkin(null)}>
                            <IconBiXLg/>
                            {t('common.action.cancel')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Modal>}
    </Grid>;
}

export interface LibraryItemProps {
    data: Skin
    capes: any[]
    index: number
    loading: boolean
    useSkin: (value: number) => void
    editSkin: (value: number) => void
}
export function LibraryItem({ data, capes, index, loading, useSkin, editSkin }: LibraryItemProps) {
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
			slim={data.variant === 'SLIM'}
            skin={`data:image/png;base64,${data.image}`}
            cape={capes?.find(c => c.id === data.cape)?.url}
            width={100}
            height={128}
        />}
        <Grid spacing={8}>
            <Button size="smaller" theme="accent" onClick={() => useSkin(index)} disabled={loading}>
                {t('common.action.use')}
            </Button>
            <Button size="smaller" theme="secondary" onClick={() => editSkin(index)} disabled={loading}>
                <IconBiPencilFill/>
                {t('common.action.edit')}
            </Button>
        </Grid>
    </Grid>;
}