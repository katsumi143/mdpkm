import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, Grid, Select, Button, Typography, TextHeader, InputLabel, BasicSpinner } from 'voxeliface';

import Modal from '../Modal';
import ImageWrapper from '../ImageWrapper';
import VersionPicker from '../VersionPicker';

import { LoaderIssue } from '../../../mdpkm';
import { toast, getImage } from '../../../util';
import { useComponentVersions } from '../../../voxura';
import { Instance, Component, InstanceState, COMPONENT_MAP, ComponentType, GameComponent, ComponentVersion, VersionedComponent } from '../../../../voxura';
export interface InstanceLoaderProps {
	instance: Instance
}
export default function InstanceLoader({ instance }: InstanceLoaderProps) {
	const { t } = useTranslation('interface');
	const { store } = instance;
	const component = instance.gameComponent;
	const [adding, setAdding] = useState(false);

	if (instance.state !== InstanceState.None)
		return <Typography size={12} color="#ffba64" margin="8px 16px" noSelect>
			<IconBiExclamationTriangleFill/>
			{t('instance_page.settings.disabled')}
		</Typography>;

	const { components } = store;
	const otherComponents = components.filter(c => c.type !== ComponentType.Game);
	return <React.Fragment>
		<Link size={12} padding="4px 8px">
			<IconBiQuestionLg/>
			You may find this page confusing at first, click here for more information!
		</Link>

		<Typography size={12} color="$secondaryColor" margin="8px 0 0" noSelect>
			{t('common.label.game_component')}
		</Typography>
		<ComponentUI instance={instance} component={component}/>

		{!!otherComponents.length && <Typography size={12} color="$secondaryColor" margin="16px 0 0" noSelect>
			{t('common.label.other_components')}
		</Typography>}
		<Grid spacing={8} vertical>
			{otherComponents.map((component, key) =>
				<ComponentUI key={component.id} instance={instance} component={component}/>
			)}
		</Grid>
		<Button theme="accent" onClick={() => setAdding(true)}>
			<IconBiPlusLg />
			{t('common.action.add_component')}
		</Button>

		{adding && <ComponentAdder onClose={() => setAdding(false)} instance={instance} />}
	</React.Fragment>
}

import ExclamationOctagonFill from '~icons/bi/exclamation-octagon-fill';
import ExclamationTriangleFill from '~icons/bi/exclamation-triangle-fill';
const ISSUE_ICONS = [ExclamationTriangleFill, ExclamationOctagonFill];

export interface IssueProps {
	issue: LoaderIssue
}
export function Issue({ issue }: IssueProps) {
	const { t } = useTranslation();
	const Icon = ISSUE_ICONS[issue.type];
	return <Grid padding="12px 16px" spacing={16} background="$secondaryBackground2" borderRadius={16}>
		<Typography><Icon /></Typography>
		<Grid spacing={2} vertical>
			<Typography size={14} spacing={6} lineheight={1}>
				{t(`app.mdpkm.common:loader_issue.${issue.id}`, issue.extra)}
				<Typography size={10} color="$secondaryColor" weight={400} margin="2px 0 0" lineheight={1}>
					({t(`app.mdpkm.common:loader_issue.type.${issue.type}`)})
				</Typography>
			</Typography>
			<Typography size={12} color="$secondaryColor" lineheight={1}>
				{t(`app.mdpkm.common:loader_issue.${issue.id}.body`, issue.extra)}
			</Typography>
		</Grid>
	</Grid>;
}

export interface ComponentProps {
	instance: Instance
	component: Component
}
export function ComponentUI({ instance, component }: ComponentProps) {
	const { t } = useTranslation('interface');
	const [editing, setEditing] = useState(false);
	const isGame = component instanceof GameComponent;
	const isVersioned = component instanceof VersionedComponent;
	const remove = () => {
		const { store } = instance;
		store.components = store.components.filter(c => c !== component);
		store.save().then(() => instance.emitEvent('changed'));
	};
	return <Grid spacing={12} padding="8px 0 8px 8px" smoothing={1} alignItems="center" borderRadius={16} css={{
		border: 'transparent solid 1px',
		background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
	}}>
		<ImageWrapper src={getImage(`component.${component.id}`)} size={40} smoothing={1} canPreview background="$secondaryBackground" borderRadius={8} />
		<Grid spacing={2} vertical justifyContent="center">
			<Typography noSelect lineheight={1}>
				{t(`voxura:component.${component.id}`)}
			</Typography>
			{isVersioned && <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
				{t('component.version', [component.version])}
			</Typography>}
		</Grid>
		<Grid height="100%" css={{ marginLeft: 'auto' }}>
			{isVersioned && <Link size={12} padding="0 16px" onClick={() => setEditing(true)}>
				<IconBiPencilFill/>
				{t('common.action.edit')}
			</Link>}
			{!isGame && <Link size={12} padding="0 16px" onClick={remove}>
				<IconBiTrash3Fill/>
				{t('common.action.remove')}
			</Link>}
		</Grid>
		{editing && isVersioned && <ComponentEditor onClose={() => setEditing(false)} component={component} />}
	</Grid>;
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
	const components = COMPONENT_MAP.filter(c => c.instanceTypes.includes(instance.type) && c.type !== ComponentType.Game && !instance.store.components.some(s => s.id === c.id));
	if (!components.length) {
		onClose();
		return null;
	}

	const versions = useComponentVersions(components[component!] as typeof VersionedComponent)
	const saveChanges = () => {
		setSaving(true);
		if (!versions)
			throw new Error();

		instance.store.components.push(new components[component!](instance, {
			version: version?.id
		}));
		instance.store.save().then(() => {
			instance.emitEvent('changed');
			toast('changes_saved', [components[component!].id]);
			onClose();
		});
	};
	return <Modal width="60%">
		<TextHeader noSelect>Component Adder</TextHeader>
		<InputLabel>Component</InputLabel>
		<Select.Minimal value={component} onChange={setComponent} loading={!versions && component !== null} disabled={(!versions || saving) && component !== null}>
			<Select.Group name="Available Instance Components">
				{components.map((component, key) => <Select.Item key={component.id} value={key}>
					{t(`voxura:component.${component.id}`)}
				</Select.Item>)}
			</Select.Group>
			<Select.Item value={null} disabled>
				Select a component
			</Select.Item>
		</Select.Minimal>

		{versions?.length !== 0 && <React.Fragment>
			<InputLabel spacious>Component Version</InputLabel>
			<Typography size={14} noSelect>
				{version ? `${t(`voxura:component.${components[component]?.id}.release_category.${version.category}.singular`)} ${version.id}` : t('common.input_placeholder.required')}
			</Typography>

			<Grid height={256} margin="16px 0 0">
				{versions && <VersionPicker id={components[component]?.id} value={version} versions={versions} onChange={setVersion} />}
			</Grid>
		</React.Fragment>}

		<Grid margin="16px 0 0" spacing={8}>
			<Button theme="accent" onClick={saveChanges} disabled={!versions || saving}>
				{saving ? <BasicSpinner size={16} /> : <IconBiPlusLg />}
				Add Component
			</Button>
			<Button theme="secondary" onClick={onClose} disabled={(!versions || saving) && component !== null}>
				<IconBiXLg/>
				{t(`common.action.cancel`)}
			</Button>
		</Grid>
	</Modal>;
}

export interface ComponentEditorProps {
	onClose: () => void
	component: VersionedComponent
};
export function ComponentEditor({ onClose, component }: ComponentEditorProps) {
	const { t } = useTranslation('interface');
	const versions = useComponentVersions(component);
	const versionMatcher = (v: ComponentVersion) => v.id === component.version;
	const [saving, setSaving] = useState(false);
	const [version, setVersion] = useState<ComponentVersion | null>(null);
	const saveChanges = () => {
		setSaving(true);
		component.version = version!.id;

		const { instance } = component;
		instance.store.save().then(() => {
			instance.emitEvent('changed');
			toast('changes_saved', [component.id]);
			onClose();
		});
	};
	return <Modal width="60%">
		<TextHeader noSelect>Component Editor ({t(`voxura:component.${component.id}`)})</TextHeader>
		<InputLabel>Component Version</InputLabel>
		<Typography size={14} noSelect>
			{version ? `${t(`voxura:component.${component.id}.release_category.${version.category}.singular`)} ${version.id}` : t('common.input_placeholder.required')}
		</Typography>

		<Grid height={256} margin="16px 0 0">
			{versions && <VersionPicker id={component.id} value={version ?? versions?.filter(v => v.some(versionMatcher))[0]?.find(versionMatcher) ?? null} versions={versions} onChange={setVersion} />}
		</Grid>

		<Grid margin="16px 0 0" spacing={8}>
			<Button theme="accent" onClick={saveChanges} disabled={!versions || saving}>
				{saving ? <BasicSpinner size={16}/> : <IconBiPencilFill/>}
				{t('common.action.save_changes')}
			</Button>
			<Button theme="secondary" onClick={onClose} disabled={!versions || saving}>
				<IconBiXLg/>
				{t('common.action.cancel')}
			</Button>
		</Grid>
	</Modal>;
}