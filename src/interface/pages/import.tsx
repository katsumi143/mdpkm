import { exists } from '@tauri-apps/api/fs';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Link, Grid, Image, Select, Button, TextInput, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import Avatar from '../components/Avatar';
import Component from '../components/InstanceComponent';
import FileSelect from '../components/FileSelect';
import WarningText from '../components/WarningText';

import { i } from '../../util';
import voxura from '../../voxura';
import { useAppDispatch } from '../../store/hooks';
import { InstanceImporters } from '../../../voxura';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
import type { InstanceImporter, InstanceArchiveMetadata } from '../../../voxura';
export default function Import() {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const [name, setName] = useState('');
	const [path, setPath] = useState('');
	const [data, setData] = useState<InstanceArchiveMetadata | null>(null);
	const [state, setState] = useState<[number, number, any[]] | null>(null);
	const [warning, setWarning] = useState(false);
	const [reading, setReading] = useState(false);
	const [importer, setImporter] = useState<InstanceImporter | undefined | null>(null);
	const [importing, setImporting] = useState(false);
	const archiveExt = path.split('.').reverse()[0];
	const returnHome = () => changePage('instances');
	const changePage = (page: string) => dispatch(setPage(page));
	const finish = () => {
		setImporting(true);
		setState([0, 0, []]);
		voxura.instances.createInstance(name || data!.name, data!.instanceType).then(instance => {
			instance.store.components.push(...data!.components.map((c : any) => new c.target(instance, c)));
			return importer!.import(instance, path, data!.metadata, voxura.downloader, (...a) => setState(a))
				.then(() => instance);
		}).then(instance => {
			returnHome();
			dispatch(setCurrentInstance(instance.id));
			instance.store.save();
		});
	};
	const readFile = async () => {
		setReading(true);
		importer!.read(path).then(setData);
	};
	useEffect(() => {
		const instanceName = name || data?.name;
		setWarning(voxura.getInstances().some(i => i.name === instanceName));
	}, [name]);
	useEffect(() => {
		if (data)
			setName(data.name);
	}, [data]);
	useEffect(() => {
		setImporter(InstanceImporters.find(i => i.extensions.includes(archiveExt)));
	}, [archiveExt]);
	
	return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical>
		<Typography size={20} noSelect>
			{t('import_file')}
		</Typography>
		<Link size={12} onClick={() => data ? setData(null) : changePage('instances')} disabled={importing}>
			<IconBiArrowLeft/>
			{t(data ? 'import_file.return_select' : 'common.action.return_to_instances')}
		</Link>
		<Grid width="100%" height="100%" spacing={16} alignItems="center" justifyContent="center">
			{!data ? <Grid width={512} margin="0 48px" padding="0 0 64px" vertical>
				<InputLabel spacious>{t('import_file.select')}</InputLabel>
				<FileSelect name={t('import_file.ext_name')} path={path} setPath={setPath} extensions={InstanceImporters.flatMap(i => i.extensions)}/>

				{path && <>
					<InputLabel spacious>{t('export_instance.select')}</InputLabel>
					<Select.Minimal value={importer} onChange={setImporter}>
						<Select.Group name={t('export_instance.select.group')}>
							{InstanceImporters.map(importer => <Select.Item key={importer.id} value={importer}>
								<Image src={i(`instance_exporter.${importer.id}`)} size={16}/>
								{t(`voxura:instance_exporter.${importer.id}`)}
							</Select.Item>)}
						</Select.Group>
					</Select.Minimal>
				</>}
				<Grid margin="8px 0 0" spacing={8}>
					<Button theme="accent" onClick={readFile} disabled={!path || reading || !importer}>
						{t('common.action.continue')}
						<IconBiArrowRight/>
					</Button>
					<Button theme="secondary" onClick={returnHome} disabled={reading}>
						<IconBiXLg/>
						{t('common.action.cancel')}
					</Button>
				</Grid>
			</Grid> : <Grid width="100%" height="100%" padding="32px 16px" vertical>
				<Grid spacing={16}>
					<Avatar size="lg"/>
					<Grid spacing={2} vertical justifyContent="center">
						<Typography size={24} weight={700} noSelect lineheight={1}>
							{data.name}
						</Typography>
						<Typography size={14} color="$secondaryColor" weight={400} noSelect lineheight={1}>
							by unknown
						</Typography>
					</Grid>
				</Grid>

				<Grid>
					<InputLabel spacious>{t('common.label.instance_name')}</InputLabel>
					{warning && <WarningText text={t('import_file.name_error')} margin="8px 0 0 16px"/>}
				</Grid>
				<TextInput width="100%" value={name} onChange={setName} disabled={importing} placeholder={data.name}/>

				<InputLabel spaciouser>{t('import_file.components')}</InputLabel>
				<Grid margin="0 0 16px" spacing={8} vertical>
					{data.components.map((data, key) => <Component id={data.id as any} key={key} version={data.version}/>)}
				</Grid>

				<Grid spacing={8}>
					<Button theme="accent" onClick={finish} disabled={importing || warning}>
						{importing ? <BasicSpinner size={16}/> : <IconBiCheckLg/>}
						{t('import_file.finish')}
					</Button>
					<Button theme="secondary" onClick={returnHome} disabled={importing}>
						<IconBiXLg/>
						{t('common.action.cancel')}
					</Button>
				</Grid>
			</Grid>}
		</Grid>
		{state && <>
			<Typography size={14} color="$secondaryColor" noSelect>
				{t(`voxura:instance_importer.${importer?.id}.state.${state[0]}`, state[2])}
			</Typography>
			<Grid width={`${state[1] * 100}%`} height="4px" background="$buttonBackground" css={{
				left: 0,
				bottom: 0,
				position: 'absolute',
				transition: 'width 1s'
			}}/>
		</>}
	</Grid>;
}