import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, Grid, Button, Typography, TextHeader, InputLabel, BasicSpinner } from 'voxeliface';

import Avatar from '../components/Avatar';
import Component from '../components/InstanceComponent';
import FileSelect from '../components/FileSelect';

import voxura from '../../voxura';
import { toast } from '../../util';
import { useAppDispatch } from '../../store/hooks';
import { InstanceImporters } from '../../../voxura';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
import type { InstanceImporter, InstanceArchiveMetadata } from '../../../voxura';
export default function Import() {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const [path, setPath] = useState('');
	const [data, setData] = useState<InstanceArchiveMetadata | null>(null);
	const [reading, setReading] = useState(false);
	const [importer, setImporter] = useState<InstanceImporter | null>(null);
	const [importing, setImporting] = useState(false);
	const changePage = (page: string) => dispatch(setPage(page));
	const finish = () => {
		setImporting(true);
		voxura.instances.createInstance(data!.name, data!.instanceType).then(instance => {
			instance.store.components.push(...data!.components.map((c : any) => new c.target(instance, c)));
			return importer!.import(instance, path, data!.metadata, voxura.downloader)
				.then(() => instance);
		}).then(instance => {
			changePage('instances');
			dispatch(setCurrentInstance(instance.id));
			instance.store.save();
		});
	};
	const readFile = async () => {
		setReading(true);
		const extension = path.split('.').reverse()[0];
		for (const importer of InstanceImporters)
			if (importer.extensions.includes(extension) && await importer.canImport(path)) {
				setImporter(importer);
				return importer.read(path).then(setData);
			}
	};
	return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical>
		<Typography size={20} noSelect>
			{t('import_file')}
		</Typography>
		<Link size={12} onClick={() => data ? setData(null) : changePage('instances')} disabled={importing}>
			<IconBiArrowLeft/>
			{t(data ? 'import_file.return_select' : 'common.action.return_to_instances')}
		</Link>
		<Grid width="100%" height="100%" margin="16px 0 0" spacing={16}>
			{!data ? <Grid width="100%" padding="12px 16px" vertical>
				<InputLabel spacious>{t('import_file.select')}</InputLabel>
				<FileSelect name={t('import_file.ext_name')} path={path} setPath={setPath} extensions={InstanceImporters.flatMap(i => i.extensions)}/>

				<Button theme="accent" onClick={readFile} disabled={!path || reading}>
					{t('common.action.continue')}
					<IconBiArrowRight/>
				</Button>
			</Grid> : <Grid width="100%" padding="12px 16px" vertical>
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

				<InputLabel spaciouser>{t('import_file.components')}</InputLabel>
				<Grid margin="0 0 16px" spacing={8} vertical>
					{data.components.map((data, key) => <Component id={data.id as any} key={key} version={data.version}/>)}
				</Grid>

				<Grid spacing={8}>
					<Button theme="accent" onClick={finish} disabled={importing}>
						{importing ? <BasicSpinner size={16}/> : <IconBiCheckLg/>}
						{t('import_file.finish')}
					</Button>
					<Button theme="secondary" onClick={() => changePage('instances')} disabled={importing}>
						<IconBiXLg/>
						{t('common.action.cancel')}
					</Button>
				</Grid>
			</Grid>}
		</Grid>
	</Grid>;
}