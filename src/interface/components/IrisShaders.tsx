import * as shell from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { exists, readDir } from '@tauri-apps/api/fs';
import { Grid, Button, Spinner, TextInput, Typography, BasicSpinner } from 'voxeliface';

import Shader, { ShaderItem } from './Shader';

import { getMD5Hash } from '../../../voxura/src/util';
import { useAppDispatch } from '../../store/hooks';
import { getStoredValue } from '../../../voxura/src/storage';
import { setPage, setSearchType } from '../../store/slices/interface';
import { Instance, VoxuraStore, ProjectType } from '../../../voxura';
export interface IrisShadersProps {
    instance: Instance
}
export default function IrisShaders({ instance }: IrisShadersProps) {
	const path = instance.getProjectTypePath(ProjectType.Shader);
    const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
    const [items, setItems] = useState<any[] | string | null>(null);
    const [filter, setFilter] = useState('');
	const search = () => {
		dispatch(setPage('search'));
		dispatch(setSearchType(ProjectType.Shader));
	};
    useEffect(() => {
        if (!items) {
            if (!instance)
                return;
            setItems('loading');
            exists(path).then(exists => {
                if (exists)
                    readDir(path).then(async entries => {
						const projects = await getStoredValue<VoxuraStore["projects"]>('projects', {});
                        const shaders: ShaderItem[] = [];
                        for (const { name, path, children } of entries) {
							if (!children)
								await getMD5Hash(path).then(hash => {
									const project = projects[hash];
									shaders.push({
										icon: project?.cached_icon,
										name: project?.cached_name ?? name,
										source: project?.platform,
										version: project?.version
									});
								});
                        }
                        setItems(shaders);
                    });
                else
                    setItems([]);
            });
        }
    }, [items]);
    useEffect(() => setItems(null), [instance.id]);
    return <React.Fragment>
        <Grid margin="4px 0" justifyContent="space-between">
            <Grid vertical>
                <Typography size={14} noSelect lineheight={1}>
                    {t('shaders')}
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
					placeholder={t('shaders.filter')}
				/>
				<Button theme="secondary" onClick={() => setItems(null)} disabled={items === 'loading'}>
					{items === 'loading' ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
					{t('common.action.refresh')}
				</Button>
				<Button theme="secondary" onClick={() => shell.open(path)}>
					<IconBiFolder2Open/>
					{t('common.action.open_folder')}
				</Button>
			</Grid>
        </Grid>
        {Array.isArray(items) ? items.length ?
			items?.filter(({ name }) =>
				name.toLowerCase().includes(filter)
			).map((item, key) => <Shader key={key} item={item}/>)
		: <Typography noSelect>
			{t('common.label.empty_dir')}
		</Typography> : <Spinner/>}
		<Grid margin="auto 0 16px" spacing={8}>
			<Button theme="accent" onClick={search}>
				<IconBiSearch/>
				{t('shaders.search')}
			</Button>
		</Grid>
    </React.Fragment>;
}