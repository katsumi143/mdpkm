import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, Grid, Button, Typography, TextHeader, InputLabel, BasicSpinner } from 'voxeliface';

import Component from '../components/InstanceComponent';
import FileSelect from '../components/FileSelect';

import voxura from '../../voxura';
import { toast } from '../../util';
import { useAppDispatch } from '../../store/hooks';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
import type { Platform, InstanceArchiveMetadata } from '../../../voxura';
export default function Import() {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const [path, setPath] = useState('');
	const [data, setData] = useState<InstanceArchiveMetadata | null>(null);
	const [reading, setReading] = useState(false);
	const [platform, setPlatform] = useState<Platform<any> | null>(null);
	const [importing, setImporting] = useState(false);
	const changePage = (page: string) => dispatch(setPage(page));
	const finish = () => {
		setImporting(true);
		voxura.instances.createInstance(data!.name, data!.instanceType).then(instance => {
			instance.store.components.push(...data!.components.map((c : any) => new c.target(instance, c)));
			return platform!.importInstanceArchive(instance, path, data!.metadata, voxura.downloader).then(() => instance);
		}).then(instance => {
			toast('yay!');
			changePage('instances');
			dispatch(setCurrentInstance(instance.id));
			instance.store.save();
		});
	};
	const readFile = () => {
		setReading(true);
		const extension = path.split('.').reverse()[0];
		for (const platform of Object.values(voxura.platforms))
			if (platform.instanceArchiveExts.includes(extension)) {
				setPlatform(platform);
				return platform.readInstanceArchive(path).then(setData);
			}
	};
	return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical>
		<Typography size={20} noSelect>
			{t('import_file')}
		</Typography>
		<Link size={12} onClick={() => changePage('instances')}>
			<IconBiArrowLeft/>
			{t('common.action.return_to_instances')}
		</Link>
		<Grid width="100%" height="100%" margin="16px 0 0" spacing={16}>
			<Grid width={data ? '50%' : '100%'} padding="12px 16px" vertical>
				<InputLabel spacious>{t('import_file.select')}</InputLabel>
				<FileSelect name={t('import_file.ext_name')} path={path} setPath={setPath} extensions={['mdpki', 'mrpack']}/>

				<Button theme="accent" onClick={readFile} disabled={!path || reading}>
					{t('common.action.continue')}
					<IconBiArrowRight/>
				</Button>
			</Grid>
			{data && <Grid width="100%" padding="12px 16px" vertical>
				<TextHeader spacing={16} noSelect>
					{data.name}
				</TextHeader>

				<InputLabel spacious>{t('import_file.components')}</InputLabel>
				<Grid spacing={8} vertical>
					{data.components.map((data, key) => <Component id={data.id as any} key={key} version={data.version}/>)}
				</Grid>

				<Button theme="accent" onClick={finish} disabled={importing}>
					{importing ? <BasicSpinner/> : <IconBiCheckLg/>}
					{t('import_file.finish')}
				</Button>
			</Grid>}
		</Grid>
	</Grid>;
}