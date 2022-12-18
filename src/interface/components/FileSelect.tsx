import React from 'react';
import { open } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from 'voxeliface';

export interface FileSelectProps {
	name: string,
	path?: string,
	setPath: (path: string) => void,
	disabled?: boolean,
	extensions?: string[]
};
export default function FileSelect({ name, path, setPath, disabled, extensions = [] }: FileSelectProps) {
	const { t } = useTranslation('interface');
	const select = () => open({
        filters: [{ name, extensions }]
    }).then(path => {
        if (typeof path === 'string')
            setPath(path);
    });
	return <TextInput
		width="100%"
		value={path ? `.../${path.split('\\').slice(-2).join('/')}` : ''}
		readOnly
		onChange={() => null}
		placeholder={t('select_file.none')}
	>
		<Button onClick={select} disabled={disabled}>
			<IconBiFolder2Open fontSize={14}/>
			{t('select_file')}
		</Button>
	</TextInput>;
};