import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Modal from '../Modal';
import ImageWrapper from '../ImageWrapper';
import VersionPicker from '../VersionPicker';
import { Link, Grid, Select, Button, Typography, TextHeader, InputLabel, BasicSpinner } from '../../../../voxeliface';

import GameComponent from '../../../../voxura/src/instances/component/game-component';
import { LoaderIssue } from '../../../mdpkm';
import VersionedComponent from '../../../../voxura/src/instances/component/versioned-component';
import { toast, getImage } from '../../../util';
import { ComponentVersion } from '../../../../voxura/src/types';
import { useComponentVersions } from '../../../voxura';
import { Instance, COMPONENT_MAP } from '../../../../voxura';
import InstanceComponent, { ComponentType } from '../../../../voxura/src/instances/component';
export type InstanceLoaderProps = {
	instance: Instance
};
export default function InstanceLoader({ instance }: InstanceLoaderProps) {
	const { t } = useTranslation();
	const { store } = instance;
	const component = instance.gameComponent;
	const [adding, setAdding] = useState(false);

	const { components } = store;
	const otherComponents = components.filter(c => c.type === ComponentType.Loader);
	return <React.Fragment>
		<Link size={12} padding="4px 8px">
			<IconBiQuestionLg/>
			You may find this page confusing at first, click here for more information!
		</Link>

		<Typography size={12} color="$secondaryColor" margin="8px 0 0">
			{t('interface:common.label.game_component')}
		</Typography>
		<Component component={component}/>

		{!!otherComponents.length && <Typography size={12} color="$secondaryColor" margin="16px 0 0">
			{t('interface:common.label.other_components')}
		</Typography>}
		<Grid spacing={8} vertical>
			{otherComponents.map((component, key) =>
				<Component key={key} component={component} />
			)}
		</Grid>
		<Button theme="accent" onClick={() => setAdding(true)}>
			<IconBiPlusLg />
			{t('interface:common.action.add_component')}
		</Button>

		{adding && <ComponentAdder onClose={() => setAdding(false)} instance={instance} />}
	</React.Fragment>
};

import ExclamationOctagonFill from '~icons/bi/exclamation-octagon-fill';
import ExclamationTriangleFill from '~icons/bi/exclamation-triangle-fill';
const ISSUE_ICONS = [ExclamationTriangleFill, ExclamationOctagonFill];

type IssueProps = {
	issue: LoaderIssue
};
function Issue({ issue }: IssueProps) {
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
};

export type ComponentProps = {
	component: InstanceComponent
};
function Component({ component }: ComponentProps) {
	const { t } = useTranslation();
	const [editing, setEditing] = useState(false);
	const isGame = component instanceof GameComponent;
	const isVersioned = component instanceof VersionedComponent;
	return <Grid spacing={12} padding="8px 0 8px 8px" alignItems="center" borderRadius={16} css={{
		border: 'transparent solid 1px',
		background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
	}}>
		<ImageWrapper src={getImage(`component.${component.id}`)} size={40} shadow canPreview background="$secondaryBackground" borderRadius={8} />
		<Grid spacing={4} vertical justifyContent="center">
			<Typography lineheight={1}>
				{t(`voxura:component.${component.id}`)}
			</Typography>
			{isVersioned && <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
				{t('interface:component.version', [component.version])}
			</Typography>}
		</Grid>
		<Grid height="100%" css={{ marginLeft: 'auto' }}>
			{isVersioned && <Link size={12} padding="0 16px" onClick={() => setEditing(true)}>
				<IconBiPencilFill />
				{t('app.mdpkm.common:actions.edit')}
			</Link>}
			{!isGame && <Link size={12} padding="0 16px">
				<IconBiTrash3Fill />
				{t('app.mdpkm.common:actions.remove')}
			</Link>}
		</Grid>
		{editing && isVersioned && <ComponentEditor onClose={() => setEditing(false)} component={component} />}
	</Grid>;
};

export type ComponentAdderProps = {
	onClose: () => void,
	instance: Instance
};
function ComponentAdder({ onClose, instance }: ComponentAdderProps) {
	const { t } = useTranslation();
	const [saving, setSaving] = useState(false);
	const [version, setVersion] = useState<ComponentVersion | null>(null);
	const [component, setComponent] = useState<number>(0);
	const components = COMPONENT_MAP.filter(c => c.type !== ComponentType.Game && !instance.store.components.some(s => s.id === c.id));
	if (!components.length) {
		toast('Prompt cancelled', 'There are no components available.');
		onClose();
		return null;
	}

	const versions = useComponentVersions(components[component] as typeof VersionedComponent);
	const saveChanges = () => {
		setSaving(true);
		if (!versions)
			throw new Error();

		instance.store.components.push(new components[component](instance, {
			version: version!.id
		}));
		instance.store.save().then(() => {
			instance.emitEvent('changed');
			toast('Your changes have been saved', 'The component was saved successfully.');
			onClose();
		});
	};
	return <Modal width="60%">
		<TextHeader>Component Adder</TextHeader>
		<InputLabel>Component</InputLabel>
		<Select.Root value={component} onChange={setComponent} disabled={!versions || saving}>
			<Select.Group name="Available Instance Components">
				{components.map((component, key) => <Select.Item key={key} value={key}>
					{t(`voxura:component.${component.id}`)}
				</Select.Item>)}
			</Select.Group>
		</Select.Root>

		<InputLabel spacious>Component Version</InputLabel>
		<Typography size={14}>
			{version ? `${t(`voxura:component.${components[component].id}.release_category.${version.category}.singular`)} ${version.id}` : t('interface:common.input_placeholder.required')}
		</Typography>

		<Grid height={256} margin="16px 0 0">
			{versions && <VersionPicker id={components[component].id} value={version} versions={versions} onChange={setVersion} />}
		</Grid>

		<Grid margin="16px 0 0" spacing={8}>
			<Button theme="accent" onClick={saveChanges} disabled={!versions || saving}>
				{saving ? <BasicSpinner size={16} /> : <IconBiPlusLg />}
				Add Component
			</Button>
			<Button theme="secondary" onClick={onClose} disabled={!versions || saving}>
				<IconBiXLg />
				{t(`app.mdpkm.common:actions.cancel`)}
			</Button>
		</Grid>
	</Modal>;
};

export type ComponentEditorProps = {
	onClose: () => void,
	component: VersionedComponent
};
function ComponentEditor({ onClose, component }: ComponentEditorProps) {
	const { t } = useTranslation();
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
			toast('Your changes have been saved', 'The component was saved successfully.');
			onClose();
		});
	};
	return <Modal width="60%">
		<TextHeader>Component Editor ({t(`voxura:component.${component.id}`)})</TextHeader>
		<InputLabel>Component Version</InputLabel>
		<Typography size={14}>
			{version ? `${t(`voxura:component.${component.id}.release_category.${version.category}.singular`)} ${version.id}` : t('interface:common.input_placeholder.required')}
		</Typography>

		<Grid height={256} margin="16px 0 0">
			{versions && <VersionPicker id={component.id} value={version ?? versions?.filter(v => v.some(versionMatcher))[0]?.find(versionMatcher) ?? null} versions={versions} onChange={setVersion} />}
		</Grid>

		<Grid margin="16px 0 0" spacing={8}>
			<Button theme="accent" onClick={saveChanges} disabled={!versions || saving}>
				{saving ? <BasicSpinner size={16}/> : <IconBiPencilFill/>}
				{t(`app.mdpkm.common:actions.save_changes`)}
			</Button>
			<Button theme="secondary" onClick={onClose} disabled={!versions || saving}>
				<IconBiXLg/>
				{t(`app.mdpkm.common:actions.cancel`)}
			</Button>
		</Grid>
	</Modal>;
};