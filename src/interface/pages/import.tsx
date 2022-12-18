import { open } from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, Grid, Alert, Button, Typography, TextHeader, InputLabel } from 'voxeliface';

import FileSelect from '../components/FileSelect';
import { setPage } from '../../store/slices/interface';
import { useAppDispatch } from '../../store/hooks';
export default function Import() {
    const { t } = useTranslation('interface');
    const dispatch = useAppDispatch();
    const [path, setPath] = useState('');
    const [data, setData] = useState(null);
    const [reading, setReading] = useState(false);
    const changePage = (page: string) => dispatch(setPage(page));
    const readFile = () => {
        setReading(true);
    };
    return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical>
        <Typography size={20}>
            {t('import_file')}
        </Typography>
        <Link size={12} onClick={() => changePage('instances')}>
            <IconBiArrowLeft/>
            {t('common.action.return_to_instances')}
        </Link>
        <Grid width="100%" height="100%" margin="16px 0 0" spacing={16}>
            <Grid width={data ? '50%' : '100%'} padding="12px 16px" vertical background="$secondaryBackground2" borderRadius={8}>
                <TextHeader spacing={12}>
                    <IconBiFolder2Open/>
                    {t('select_file')}
                </TextHeader>

                <InputLabel spacious>{t('import_file.select')}</InputLabel>
                <FileSelect name={t('import_file.ext_name')} path={path} setPath={setPath} extensions={['mdpki']}/>

                <Button theme="accent" onClick={readFile} disabled={!path || reading}>
                    {t('common.action.continue')}
                    <IconBiArrowRight/>
                </Button>
                {reading && <Alert title="uh oh!" severity="error">
                    this feature is unfinished!
                </Alert>}
            </Grid>
            {data && <Grid width="100%" padding="12px 16px" vertical background="$secondaryBackground2" borderRadius={8}>
                <TextHeader spacing={12}>
                    <IconBiPlusLg/>
                    {t('common.action.import_instance')}
                </TextHeader>
            </Grid>}
        </Grid>
    </Grid>;
};