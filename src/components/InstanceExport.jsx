import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Save2, FileText, FolderFill, FiletypePng, FiletypeJpg, FiletypeSvg, FiletypeTxt, FiletypeJson, ArrowClockwise, FileEarmarkZip } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Toggle from './Toggle';
import Button from '/voxeliface/components/Button';
import Divider from '/voxeliface/components/Divider';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import Util from '../common/util';
import Instances from '../common/instances';

const banned = [
    'icon\\.(png|jpg|svg)',
    'dashloader-cache',
    'modcache.json',
    'modpack.json',
    'config.json',
    '.ReAuth.cfg',
    '.mixin.out',
    'essential',
    '.fabric',
    'natives',
    'mods'
];
const sensitive = [
    'crash-reports',
    'logs'
];
const select = [
    'icon\\.(png|jpg|svg)',
    'modpack.json',
    'config.json',
    'options.txt',
    'config',
    'mods'
];
export default function InstanceExport({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const [items, setItems] = useState();
    const exportInstance = () => Instances.exportInstance(instanceId,
        items.filter(e => e.selected).map(e => e.path)
    );
    useEffect(() => {
        if(!items) {
            if(!instance) return;
            if (!instance?.path)
                return toast.error('Invalid path');
            
            setItems('loading');
            Util.readDirRecursive(instance.path).then(files =>
                setItems(files.map(file => {
                    file.banned = banned.some(name => new RegExp(`^${name}$`).test(file.name) || new RegExp(`^/${name}/`).test(file.path.replace(instance.path, '').replace(/\/+|\\+/g, '/')));
                    file.sensitive = sensitive.indexOf(file.name) >= 0;
                    file.selected = select.some(name => new RegExp(`^${name}$`).test(file.name) || new RegExp(`^/${name}/`).test(file.path.replace(/\/+|\\+/g, '/').replace(instance.path.replace(/\/+|\\+/g, '/'), '')));
                    return file;
                }))
            );
        }
    }, [items]);
    useEffect(() => setItems(), [instanceId]);
    return <React.Fragment>
        <Grid width="fit-content" spacing={4} direction="vertical">
            <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                {t('app.mdpkm.export_instance.title')}
            </Typography>
            <Grid spacing={8}>
                <Button theme="accent" onClick={exportInstance}>
                    <Save2/>
                    {t('app.mdpkm.export_instance.buttons.export_mdpki')}
                </Button>
                <Button theme="secondary" disabled>
                    <Image src="img/icons/modrinth-white.svg" size={14}/>
                    {t('app.mdpkm.export_instance.buttons.export_modrinth')}
                </Button>
                <Button theme="secondary" disabled>
                    <FileEarmarkZip/>
                    {t('app.mdpkm.export_instance.buttons.export_curseforge')}
                </Button>
            </Grid>
        </Grid>
        <Divider width="100%" height={1}/>
        <Grid justifyContent="space-between">
            <Typography size=".9rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                {t('app.mdpkm.export_instance.files.title')}
            </Typography>
            <Button theme="secondary" onClick={() => setItems()} disabled={items === 'loading'}>
                {items === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                {t('app.mdpkm.common:actions.refresh')}
            </Button>
        </Grid>
        <Grid direction="vertical" borderRadius={8} css={{
            border: '1px solid $secondaryBorder2',
            overflow: 'hidden auto'
        }}>
            {Array.isArray(items) && items.filter(({ path }) =>
                path.replace(/\/+|\\+/g, '/')
                .replace(instance.path.replace(/\/+|\\+/g, '/'), '')
                .match(/\/+|\\+/g)?.length === 1
            ).sort((a, b) => b.name.localeCompare(a.name))
            .sort(({ isDir }, { isDir2 }) => isDir === isDir2 ? 0 : isDir ? -1 : 1)
            .map(({ name, isDir, banned, selected, sensitive }, index) => {
                const Icon = Object.entries({
                    '\\.txt$': FiletypeTxt,
                    '\\.png$': FiletypePng,
                    '\\.jpg$': FiletypeJpg,
                    '\\.svg$': FiletypeSvg,
                    '\\.json$': FiletypeJson,
                }).find(([reg]) => new RegExp(reg).test(name))?.[1] ?? (isDir ? FolderFill : FileText);
                return <React.Fragment key={index}>
                    <Grid spacing={8} padding="4px 8px" alignItems="center">
                        <Toggle size="small" value={selected} disabled={banned} onChange={event => {
                            items.find(f => f.name === name).selected = event.target.value;
                            if(isDir)
                                for (const file of items)
                                    if(!file.banned && file.path.replace(/\/+|\\+/g, '/').replace(instance.path.replace(/\/+|\\+/g, '/'), '').startsWith(`/${name}/`))
                                        file.selected = event.target.value;
                            setItems(items);
                        }}/>
                        <Icon color={banned ? "var(--colors-secondaryColor)" : "var(--colors-primaryColor)"}/>
                        <Typography color={banned ? "$secondaryColor" : "$primaryColor"} family="Nunito">
                            {name}
                            {banned && <Typography size=".7rem" color="$secondaryColor" weight={400} margin="0 0 0 8px" family="Nunito" lineheight={1}>
                                {t('app.mdpkm.export_instance.files.banned')}
                            </Typography>}
                            {sensitive && <Typography size=".7rem" color="$secondaryColor" weight={400} margin="0 0 0 8px" family="Nunito" lineheight={1}>
                                {t('app.mdpkm.export_instance.files.sensitive')}
                            </Typography>}
                        </Typography>
                    </Grid>
                    {index < items.length - 1 && <Divider width="100%" css={{ minHeight: 1 }}/>}
                </React.Fragment>;
            })}
        </Grid>
    </React.Fragment>;
};