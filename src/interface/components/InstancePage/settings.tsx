import { exists } from '@tauri-apps/api/fs';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Image, Select, Slider, Dialog, Button, TabItem, TextInput, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import Tabs from '../Tabs';
import Modal from '../Modal';
import FileSelect from '../FileSelect';
import WarningText from '../WarningText';

import { useBind } from '../../../util/hooks';
import { i, toast } from '../../../util';
import { useAppDispatch } from '../../../store';
import { setCurrentInstance } from '../../../store/slices/interface';
import { TOTAL_SYSTEM_MEMORY } from '../../../util/constants';
import { Instance, InstanceState, InstanceExporters, ButtonSettingType, ComponentSettingType } from '../../../../voxura';

const BUTTON_TYPE_MAP = {
	[ButtonSettingType.Primary]: 'accent',
	[ButtonSettingType.Secondary]: 'secondary'
} as const;
export interface InstanceSettingsProps {
	instance: Instance
}
export default function InstanceSettings({ instance }: InstanceSettingsProps) {
	const { t } = useTranslation('interface');
	const memory = useBind([instance.store.memoryAllocation]);
	const dispatch = useAppDispatch();
	const resolution = useBind(instance.store.gameResolution.size);
	const [tab, setTab] = useState(0);
	const [name, setName] = useState(instance.displayName);
	const [saving, setSaving] = useState(false);
	const [exporting, setExporting] = useState(false);

	const disabled = instance.state !== InstanceState.None;
	const saveName = () => {
		setSaving(true);
		instance.setDisplayName(name).then(() => setSaving(false));
	};
	const deleteInstance = () => {
		dispatch(setCurrentInstance(''));
		instance.delete();
	};
	useEffect(() => {
		setName(instance.displayName);
		memory.onChange([instance.store.memoryAllocation]);
		resolution.onChange(instance.store.gameResolution.size);
	}, [instance]);
	useEffect(() => {
		instance.store.gameResolution = { size: resolution.value };
		instance.store.memoryAllocation = memory.value[0];
		instance.store.save();
	}, [memory.value, resolution.value]);

	const nameInvalid = name.length <= 0 || name.length > 24;
	return <>
		<Tabs value={tab} onChange={setTab} css={{ height: '100%' }}>
			<TabItem name="General" icon={<IconBiGear/>} value={0} spacing={0} padding="0 8px !important">
				<InputLabel>
					{t('common.label.display_name')}
				</InputLabel>
				<Grid spacing={8}>
					<TextInput value={name} onChange={setName} disabled={saving}/>
					{!saving && !nameInvalid && name !== instance.displayName && <Button theme="accent" onClick={saveName}>
						<IconBiPencilFill/>
						{t('common.action.save_changes')}
					</Button>}
					{saving && <BasicSpinner size={24} margin="2px 0"/>}
					{nameInvalid && <WarningText text={t('instance_page.settings.name.invalid')} margin="6px 8px"/>}
				</Grid>

				<InputLabel spaciouser>
					{t('instance_page.settings.resolution')}
				</InputLabel>
				<Grid spacing={8}>
					<Grid vertical>
						<InputLabel>{t('common.label.resolution_width')}</InputLabel>
						<TextInput
							width={80}
							value={Math.max(0, resolution.value[0] || 0).toString()}
							onChange={value => {
								const number = parseInt(value);
								resolution.onChange(val => [number, val[1]]);
							}}
							disabled={disabled || saving}
						/>
					</Grid>
					<Grid vertical>
						<InputLabel>{t('common.label.resolution_height')}</InputLabel>
						<TextInput
							width={80}
							value={Math.max(0, resolution.value[1] || 0).toString()}
							onChange={value => {
								const number = parseInt(value);
								resolution.onChange(val => [val[0], number]);
							}}
							disabled={disabled || saving}
						/>
					</Grid>
				</Grid>
				
				<Grid margin="auto 0 16px" vertical>
					<InputLabel spaciouser>
						{t('instance_page.settings.other')}
					</InputLabel>
					<Grid spacing={8}>
						<Button theme="accent" onClick={() => setExporting(true)} disabled={disabled || saving}>
							<IconBiBoxSeam/>
							{t('common.action.export')}
						</Button>
						<Dialog.Root>
							<Dialog.Trigger asChild>
								<Button theme="secondary" disabled={disabled || saving}>
									<IconBiTrash3Fill fontSize={14}/>
									{t('common.action.delete')}
								</Button>
							</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Content>
									<Dialog.Title>{t('dialog.delete_instance')}</Dialog.Title>
									<Dialog.Description css={{ whiteSpace: 'pre' }}>
										{t('dialog.delete_instance.body', [instance.displayName])}
									</Dialog.Description>
									<Grid spacing={16} justifyContent="end">
										<Dialog.Close asChild>
											<Button theme="accent" onClick={deleteInstance}>
												<IconBiCheckLg/>
												{t('common.action.confirm')}
											</Button>
										</Dialog.Close>
										<Dialog.Close asChild>
											<Button theme="secondary">
												<IconBiXLg/>
												{t('common.action.cancel')}
											</Button>
										</Dialog.Close>
									</Grid>
								</Dialog.Content>
							</Dialog.Portal>
						</Dialog.Root>
					</Grid>
				</Grid>
			</TabItem>
			{instance.store.components.map(({ id, settings }, key) => {
				if (settings.length > 0) {
					const tstart = `voxura:component.${id}.settings`;
					return <TabItem key={id} name={t(tstart)} icon={<IconBiGear/>} value={1 + key} spacing={0}>
						{settings.map(({ id, items }) => <React.Fragment key={id}>
							<InputLabel>{t(`${tstart}.${id}`)}</InputLabel>
							<Grid spacing={8}>
								{items.map((item, key) => {
									if (item.type === ComponentSettingType.Button)
										return <Button key={`${id}.item.${key}`} theme={BUTTON_TYPE_MAP[item.buttonType!] ?? 'accent'} onClick={item.onClick}>
											<IconBiGear/>
											{t(`${tstart}.${id}.item.${key}`)}
										</Button>;
								})}
							</Grid>
						</React.Fragment>)}
					</TabItem>;
				}
			}).filter(c => c)}
			<TabItem name="Advanced" icon={<IconBiGear/>} value={9999} spacing={0} padding="0 8px !important">
				<InputLabel>
					{t('instance_page.settings.memory', [memory.value[0].toLocaleString('en', { minimumFractionDigits: 1 })])}
				</InputLabel>
				<Slider
					min={.5}
					max={Math.floor((TOTAL_SYSTEM_MEMORY / 1000000000) / 1.4)}
					step={.5}
					{...memory}
				/>
			</TabItem>
		</Tabs>
		{disabled && <WarningText text={t('instance_page.settings.disabled')}/>}
		{exporting && <ExportInstance onClose={() => setExporting(false)} instance={instance}/>}
	</>;
}

export interface ExportInstanceProps {
	onClose: () => void,
	instance: Instance
}
function ExportInstance({ onClose, instance }: ExportInstanceProps) {
	const { t } = useTranslation('interface');
	const [name, setName] = useState(instance.displayName);
	const [path, setPath] = useState<string | null>(null);
	const [state, setState] = useState<[number, number, any[]] | null>(null);
	const [warning, setWarning] = useState(false);
	const [exporter, setExporter] = useState(InstanceExporters[0]);
	const [exporting, setExporting] = useState(false);

	const exportName = `${(name || instance.name).toLowerCase().replace(/\W/g, '-')}.${exporter.extension}`;
	const exportPath = `${path}/${exportName}`;
	const startExport = () => {
		setExporting(true);
		exporter.export(instance, name || instance.displayName, exportPath, (...a) => setState(a)).then(() => {
			toast('export_success', [instance.displayName, exportPath.split(/[\\\/]+/g).reverse()[1]]);
			onClose();
		});
	};
	useEffect(() => {
		if (path)
			exists(exportPath).then(setWarning);
		else
			setWarning(false);
	}, [exportPath]);

	return <Modal width="40%">
		<Typography size={24} family="$tertiary">
			{t('export_instance')}
		</Typography>

		<InputLabel spacious>{t('export_instance.select')}</InputLabel>
		<Select.Minimal value={exporter} onChange={setExporter} disabled={exporting}>
			<Select.Group name={t('export_instance.select.group')}>
				{InstanceExporters.map(exporter => <Select.Item key={exporter.id} value={exporter}>
					<Image src={i(`instance_exporter.${exporter.id}`)} size={16}/>
					{t(`voxura:instance_exporter.${exporter.id}`)}
				</Select.Item>)}
			</Select.Group>
		</Select.Minimal>

		<InputLabel spacious>{t('export_instance.name')}</InputLabel>
		<TextInput width="100%" value={name} onChange={setName} disabled={exporting}/>

		<Grid margin="8px 0 4px" justifyContent="space-between">
			<Typography size={14} color="$secondaryColor" weight={450} noSelect>
				{t('export_instance.path')}
			</Typography>
			{warning && <WarningText text={t('export_instance.warning')} margin={0}/>}
		</Grid>
		<FileSelect
			name="🤯"
			path={path ? `${path}/${exportName}` : null}
			setPath={setPath}
			disabled={exporting}
			directory
		/>

		<Grid margin="auto 0 0" padding="16px 0 0" spacing={8} justifyContent="end">
			{state && <Typography size={14} color="$secondaryColor" margin="10px auto 0 0" noSelect>
				{t(`voxura:instance_exporter.${exporter.id}.state.${state[0]}`, state[2])}
			</Typography>}
			<Button theme="accent" onClick={startExport} disabled={!path || exporting}>
				{exporting ? <BasicSpinner size={16}/> : <IconBiCheckLg/>}
				{t('export_instance.finish')}
			</Button>
			<Button theme="secondary" onClick={onClose} disabled={exporting}>
				<IconBiXLg/>
				{t('common.action.cancel')}
			</Button>
		</Grid>

		{state && <Grid width={`${state[1] * 100}%`} height="4px" background="$buttonBackground" css={{
			left: 0,
			bottom: 0,
			position: 'absolute',
			transition: 'width 1s'
		}}/>}
	</Modal>;
}