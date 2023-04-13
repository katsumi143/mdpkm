import { open } from '@tauri-apps/api/shell';
import { writeTextFile } from '@tauri-apps/api/fs';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Grid, Link, Button, Typography, BasicSpinner } from 'voxeliface';

import Modal from './Modal';
import voxura from '../../voxura';
import { useAppDispatch } from '../../store/hooks';
import { setMcServerEulaDialog } from '../../store/slices/interface';
export interface EulaDialogProps {
	instanceId: string
}
export default function EulaDialog({ instanceId }: EulaDialogProps) {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const [accepting, setAccepting] = useState(false);

	const viewEula = () => open('https://aka.ms/MinecraftEULA');
	const acceptEula = () => {
		setAccepting(true);

		const instance = voxura.getInstance(instanceId)!;
		writeTextFile(`${instance.path}/eula.txt`, 'eula=true')
			.then(() => {
				instance.launch();
				setAccepting(false);
				dispatch(setMcServerEulaDialog(null));
			});
	};
	return <Modal>
		<Typography size={24} family="$tertiary">
			{t('dialog.accept_eula')}
		</Typography>
		<Typography color="$secondaryColor" weight={400} family="$secondary" whitespace="pre">
			{t('dialog.accept_eula.body')}
		</Typography>
		<Grid margin="auto 0 0" padding="16px 0 0" spacing={8} justifyContent="end">
			<Link size={14} onClick={viewEula} css={{ marginRight: 'auto' }}>
				{t('dialog.accept_eula.link')}
				<IconBiBoxArrowUpRight fontSize={10}/>
			</Link>
			<Button theme="accent" onClick={acceptEula} disabled={accepting}>
				{accepting ? <BasicSpinner size={16}/> : <IconBiCheckLg/>}
				{t('common.action.accept_continue')}
			</Button>
			<Button theme="secondary" onClick={() => dispatch(setMcServerEulaDialog(null))}>
				<IconBiXLg/>
				{t('common.action.cancel')}
			</Button>
		</Grid>
	</Modal>;
}