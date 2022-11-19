import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Grid from '../../../voxeliface/components/Grid';
import Button from '../../../voxeliface/components/Button';
import InstanceList from '../components/InstanceList';
import InstancePage from '../components/InstancePage';

import voxura from '../../voxura';
import { toast } from '../../util';
import { Loader } from '../../../voxura';
import { LoaderSetupType } from '../../../voxura/src/types';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
export default function Instances() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const instance = useAppSelector(state => state.interface.currentInstance);
    const [loading, setLoading] = useState(false);
    const [settingUp, setSettingUp] = useState<string|null>(null);
    const [loaderVersions, setLoaderVersions] = useState(null);
    const selectInstance = (id: string) => dispatch(setCurrentInstance(id));
    const installLoader = async(name: string, loader: typeof Loader, options: any[]) => {
        const instance = await voxura.instances.createInstance(name);
        if (loader.setupType === LoaderSetupType.Versions) {
            await instance.changeLoader(loader, options[0]);
            await instance.changeVersion(options[1]);
        } else if (loader.setupType === LoaderSetupType.Custom)
            await loader.setupInstance(instance, options);

        toast('Instance added', `${name} was created successfully.`);
        setSettingUp(null);
        selectInstance(instance.id);
        setLoaderVersions(null);
    };
    /*const chooseLoader = (id: string) => {
        setLoading(true);

        const loader = getLoaderById(id);
        console.log(loader);
        if (loader.setupType === LoaderSetupType.Versions)
            loader.getVersions().then(versions => {
                setLoaderVersions(versions);

                setSettingUp(id);
                setLoading(false);
            }).catch(err => {
                setLoading(false);
                console.error(err);

                toast('Unexpected error', `Failed to fetch data for ${id}.`);
            });
        else {
            setSettingUp(id);
            setLoading(false);
        }
    };*/
    const changePage = (page: string) => dispatch(setPage(page));
    return <React.Fragment>
        <Grid width="35%" height="100%" direction="vertical" background="$blackA2" justifyContent="space-between" css={{
            maxWidth: '35%',
            borderRight: '1px solid $secondaryBorder'
        }}>
            <InstanceList id={instance}/>
            <Grid width="100%" padding={16} background="$secondaryBackground" alignItems="center" justifyContent="space-between">
                <Button theme="accent" onClick={() => changePage('create')}>
                    <IconBiPlusLg/>
                    {t('app.mdpkm.common:actions.create_instance')}
                </Button>
                <Button theme="secondary" onClick={() => changePage('import')}>
                    <IconBiFolderPlus/>
                    {t('app.mdpkm.common:actions.import2')}
                </Button>
            </Grid>
        </Grid>
        <InstancePage id={instance}/>
    </React.Fragment>;
};