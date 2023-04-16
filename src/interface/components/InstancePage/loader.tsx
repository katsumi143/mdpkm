import { open } from '@tauri-apps/api/dialog';
import { readJsonFile } from 'voxelified-commons/tauri';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, Grid, Select, Button, Typography, TextHeader, InputLabel, BasicSpinner } from 'voxeliface';

import Modal from '../Modal';
import WarningText from '../WarningText';
import VersionPicker from '../VersionPicker';
import InstanceComponent from '../InstanceComponent';

import { toast } from '../../../util';
import { useComponentVersions } from '../../../voxura';
import { Instance, InstanceState, COMPONENT_MAP, ComponentType, ComponentVersion, VersionedComponent } from '../../../../voxura';
export interface InstanceLoaderProps {
	instance: Instance
}
export default function InstanceLoader({ instance }: InstanceLoaderProps) {
	const { t } = useTranslation('interface');
	const { store } = instance;
	const component = instance.gameComponent;
	const [adding, setAdding] = useState(false);

	const disabled = instance.state !== InstanceState.None;
	const { components } = store;
	const otherComponents = components.filter(c => c.type !== ComponentType.Game);
	return <React.Fragment>
		{disabled && <WarningText text={t('instance_page.settings.disabled')}/>}
		<Link size={12} padding="4px 16px">
			<IconBiQuestionLg/>
			You may find this page confusing at first, click here for more information!
		</Link>

		<Typography size={12} color="$secondaryColor" margin="8px 0 0" noSelect>
			{t('common.label.game_component')}
		</Typography>
		<InstanceComponent id={component.id} disabled={disabled} instance={instance} component={component}/>

		{!!otherComponents.length && <Typography size={12} color="$secondaryColor" margin="16px 0 0" noSelect>
			{t('common.label.other_components')}
		</Typography>}
		<Grid spacing={8} vertical>
			{otherComponents.map(component =>
				<InstanceComponent id={component.id} key={component.id} disabled={disabled} instance={instance} component={component}/>
			)}
		</Grid>
		<Grid margin="0 0 16px">
			<Button theme="accent" onClick={() => setAdding(true)} disabled={disabled}>
				<IconBiPlusLg/>
				{t('common.action.add_component')}
			</Button>
		</Grid>

		{adding && <ComponentAdder onClose={() => setAdding(false)} instance={instance} />}
	</React.Fragment>
}

export interface ComponentAdderProps {
	onClose: () => void
	instance: Instance
}
export function ComponentAdder({ onClose, instance }: ComponentAdderProps) {
	const { t } = useTranslation('interface');
	const [saving, setSaving] = useState(false);
	const [version, setVersion] = useState<ComponentVersion | null>(null);
	const [component, setComponent] = useState<number | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const components = COMPONENT_MAP.filter(c => c.instanceTypes.includes(instance.type) && c.type !== ComponentType.Game && !instance.store.components.some(s => s.id === c.id));
	if (!components.length) {
		onClose();
		return null;
	}

	const versions = useComponentVersions(components[component!] as typeof VersionedComponent);
	const importFile = async() => {
		const path = await open({ filters: [{ name: 'JSON File', extensions: ['json'] }]});
		if (typeof path !== 'string')
			return;
		
		const json = await readJsonFile<any>(path);
		for (const component of COMPONENT_MAP)
			if (json.id === component.id) {
				const data = await component.validateSchema(json).catch(err => {
					setImportError(err.message);
					throw err;
				});
				instance.store.components.push(new (component as any)(instance, data));
				instance.store.save().then(() => {
					instance.emitEvent('changed');
					toast('changes_saved', [component.id]);
					onClose();
				});
			}
	};
	const saveChanges = () => {
		setSaving(true);
		if (!versions)
			throw new Error();

		instance.store.components.push(new (components[component!] as any)(instance, {
			version: version?.id
		}));
		instance.store.save().then(() => {
			instance.emitEvent('changed');
			toast('changes_saved', [components[component!].id]);
			onClose();
		});
	};
	return <Modal width="60%">
		<TextHeader noSelect>{t('add_component')}</TextHeader>
		<InputLabel>{t('common.label.component')}</InputLabel>
		<Select.Minimal value={component} onChange={setComponent} loading={!versions && component !== null} disabled={(!versions || saving) && component !== null}>
			<Select.Group name={t('add_component.component.group')}>
				{components.map((component, key) => <Select.Item key={component.id} value={key}>
					{t(`voxura:component.${component.id}`)}
				</Select.Item>)}
			</Select.Group>
			<Select.Item value={null} disabled>
				{t('add_component.component.none')}
			</Select.Item>
		</Select.Minimal>

		{versions?.length !== 0 && <React.Fragment>
			<InputLabel spacious>{t('add_component.version')}</InputLabel>
			<Typography size={14} noSelect>
				{version ? `${t([`voxura:component.${components[component!]?.id}.release_category.${version.category}.singular`, 'common.label.version3'])} ${version.id}` : t('common.input_placeholder.required')}
			</Typography>

			<Grid height={256} margin="16px 0 0">
				{versions && <VersionPicker id={components[component!]?.id} value={version} versions={versions} onChange={setVersion} />}
			</Grid>
		</React.Fragment>}

		<Grid margin="16px 0 0" spacing={8}>
			<Button theme="accent" onClick={saveChanges} disabled={!versions || saving}>
				{saving ? <BasicSpinner size={16} /> : <IconBiPlusLg />}
				{t('common.action.add_component')}
			</Button>
			<Button theme="secondary" onClick={onClose} disabled={(!versions || saving) && component !== null}>
				<IconBiXLg/>
				{t(`common.action.cancel`)}
			</Button>
			<Grid margin="0 0 0 auto" spacing={16}>
				{importError && <Typography size={14} weight={400} family="$secondary" textalign="right">
					{importError}
				</Typography>}
				<Button theme="secondary" onClick={importFile}>
					<IconBiFiletypeJson/>
					{t('add_component.import')}
				</Button>
			</Grid>
		</Grid>
	</Modal>;
}