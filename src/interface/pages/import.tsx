import { open } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import { Grid, Alert, Button, TextInput, Typography, TextHeader, InputLabel } from '../../../voxeliface/src';

import { setPage } from '../../store/slices/interface';
import { useAppDispatch } from '../../store/hooks';
export default function Import() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [path, setPath] = useState('');
    const [data, setData] = useState(null);
    const [reading, setReading] = useState(false);
    const changePage = (page: string) => dispatch(setPage(page));
    const selectFile = () => open({
        filters: [{ name: 'Instance Files', extensions: ['mdpki'] }]
    }).then(path => {
        if (typeof path === 'string')
            setPath(path);
    });
    const readFile = () => {
        setReading(true);
    };
    return <Grid width="100%" height="inherit" padding=".75rem 1rem" direction="vertical">
        <Typography size={20}>
            Import Instance
        </Typography>
        <Typography size={12} color="$secondaryColor" spacing={6} onClick={() => changePage('instances')} horizontal css={{
            cursor: 'pointer',
            '&:hover': {
                color: '$primaryColor'
            }
        }}>
            <IconBiArrowLeft/>
            {t('interface:common.action.return_to_instances')}
        </Typography>
        <Grid width="100%" height="100%" margin="16px 0 0" spacing={16}>
            <Grid width={data ? '50%' : '100%'} padding="12px 16px" vertical background="$secondaryBackground2" borderRadius={8}>
                <TextHeader spacing={12}>
                    <IconBiFolder2Open/>
                    Select file
                </TextHeader>

                <InputLabel spacious>Select exported instance</InputLabel>
                <TextInput
                    width="100%"
                    value={path && `.../${path.split('\\').slice(-2).join('/')}`}
                    readOnly
                    onChange={() => null}
                    placeholder={t('app.mdpkm.loader_setup.select_file.placeholder')}
                >
                    <Button onClick={selectFile} disabled={reading}>
                        <IconBiFolder2Open fontSize={14}/>
                        {t('app.mdpkm.common:actions.select_file')}
                    </Button>
                </TextInput>

                <Button theme="accent" onClick={readFile} disabled={!path || reading}>
                    {t('app.mdpkm.common:actions.continue')}
                    <IconBiArrowRight/>
                </Button>
                {reading && <Alert title="uh oh!" severity="error">
                    this feature is unfinished!
                </Alert>}
            </Grid>
            {data && <Grid width="100%" padding="12px 16px" vertical background="$secondaryBackground2" borderRadius={8}>
                <TextHeader spacing={12}>
                    <IconBiPlusLg/>
                    Import Instance
                </TextHeader>
            </Grid>}
        </Grid>
    </Grid>;
};