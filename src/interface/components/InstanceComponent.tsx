import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, Grid, Button, Typography, InputLabel, TextHeader, BasicSpinner } from 'voxeliface';

import Modal from './Modal';
import Avatar from './Avatar';
import VersionPicker from './VersionPicker';

import { toast, getImage, prettifySemver } from '../../util';
import { Instance, Component, GameComponent, ComponentVersion, VersionedComponent } from '../../../voxura';
export interface ComponentProps {
	id: string
	name?: string
	icon?: string
	version?: string
	disabled?: boolean
	instance?: Instance
	component?: Component
	versionCategory?: number
}
export default function InstanceComponent({ id, name, icon, version, disabled, instance, component, versionCategory }: ComponentProps) {
	const { t } = useTranslation('interface');
	const [editing, setEditing] = useState(false);
	const isGame = component instanceof GameComponent;
	const isVersioned = component instanceof VersionedComponent;
	const remove = () => {
		const { store } = instance!;
		store.components = store.components.filter(c => c !== component);
		store.save().then(() => instance!.emitEvent('changed'));
	};
	return <Grid spacing={12} padding="8px 0 8px 8px" smoothing={1} alignItems="center" cornerRadius={16} css={{
		border: 'transparent solid 1px',
		background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
	}}>
		<Avatar src={icon ?? getImage(`component.${id}`)} size="sm"/>
		<Grid spacing={2} vertical justifyContent="center">
			<Grid spacing={8}>
				<Typography size={15} weight={450} noSelect lineheight={1}>
					{name ?? t([`voxura:component.${id}`, 'missingno'])}
				</Typography>
				{name && <Typography size={12} color="$secondaryColor" family="$secondary" noSelect lineheight={1}>
					{t(`voxura:component.${id}`)}
				</Typography>}
			</Grid>
			{(version || isVersioned) && <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
				{t([`voxura:component.${id}.versions.category.${(component as any)?.versionCategory ?? versionCategory}.singular`, 'common.label.version3'])} {prettifySemver(version ?? (component as any)?.version, t)}
			</Typography>}
		</Grid>
		{instance && <Grid height="100%" css={{ marginLeft: 'auto' }}>
			{isVersioned && <Link size={12} padding="0 16px" onClick={() => setEditing(true)} disabled={disabled}>
				<IconBiPencilFill/>
				{t('common.action.edit')}
			</Link>}
			{!isGame && <Link size={12} padding="0 16px" onClick={remove} disabled={disabled}>
				<IconBiTrash3Fill/>
				{t('common.action.remove')}
			</Link>}
		</Grid>}
		{editing && isVersioned && <ComponentEditor onClose={() => setEditing(false)} component={component} />}
	</Grid>;
}

export interface ComponentEditorProps {
	onClose: () => void
	component: VersionedComponent
}
export function ComponentEditor({ onClose, component }: ComponentEditorProps) {
	const { t } = useTranslation('interface');
	const [saving, setSaving] = useState(false);
	const [version, setVersion] = useState<ComponentVersion | undefined>();
	const saveChanges = () => {
		setSaving(true);
		component.version = version!.id;
		component.versionCategory = version!.category;

		const { instance } = component;
		instance.store.save().then(() => {
			instance.emitEvent('changed');
			toast('changes_saved', [component.id]);
			onClose();
		});
	};
	return <Modal width="60%">
		<TextHeader noSelect>Component Editor ({t(`voxura:component.${component.id}`)})</TextHeader>
		<InputLabel>{t('add_component.version')}</InputLabel>
		<VersionPicker
			value={version}
			onChange={setVersion}
			defaultId={component.version}
			componentId={component.id}
		/>

		<Grid margin="16px 0 0" spacing={8}>
			<Button theme="accent" onClick={saveChanges} disabled={saving}>
				{saving ? <BasicSpinner size={16}/> : <IconBiPencilFill/>}
				{t('common.action.save_changes')}
			</Button>
			<Button theme="secondary" onClick={onClose} disabled={saving}>
				<IconBiXLg/>
				{t('common.action.cancel')}
			</Button>
		</Grid>
	</Modal>;
}