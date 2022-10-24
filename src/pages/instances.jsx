import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Grid from '/voxeliface/components/Grid';
import Pages from '../components/Pages';
import Button from '/voxeliface/components/Button';
import PageItem from '../components/Pages/Item';
import LoaderSetup from '../components/LoaderSetup';
import ModpackSetup from '../components/ModpackSetup';
import InstanceList from '../components/InstanceList';
import InstancePage from '../components/InstancePage';
import ImportInstance from '../components/ImportInstance';
import SelectInstanceType from '../components/SelectInstanceType';

import API from '/src/common/api';
import voxura from '../common/voxura';
export default function Home() {
    const { t } = useTranslation();
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [instance, setInstance] = useState();
    const [settingUp, setSettingUp] = useState();
    const [importPath, setImportPath] = useState();
    const [loaderVersions, setLoaderVersions] = useState();
    const setupBackToSelect = () => {
        setPage(1);
        setLoaderVersions();
        setSettingUp();
    };
    const selectBackToHome = () => setPage(0);
    const importInstance = () => {
        setPage(4);
        setLoading(false);
    };
    const selectInstance = id => setInstance(id);
    const installLoader = async(name, loader, gameVersion, loaderVersion, setState) => {
        setState('Preparing...');
        const instance = await voxura.instances.createInstance(name);
        await instance.changeLoader(loader, loaderVersion);
        await instance.changeVersion(gameVersion);

        toast.success(`${name} was created successfully.`);
        setPage(0);
        setInstance(instance.id);
        setSettingUp();
        setLoaderVersions();
    };
    const chooseLoader = async loader => {
        setLoading(true);
        try {
            if(loader === 'bedrock') {
                const versions = await API.Minecraft.Bedrock.getLoaderVersions();
                setLoaderVersions(versions);
            } else if(loader === 'modpack') {
                setPage(3);
                setLoading(false);
                return;
            } else {
                const loaderData = API.getLoader(loader);
                if(!loaderData)
                    throw new Error(`Invalid Loader: ${loader}`);
                const versions = await loaderData.source.getVersions();
                setLoaderVersions(versions);
            }
        } catch(err) {
            setLoading(false);
            return toast.error(`Failed to load ${loader};\n${err}`);
        }
        setPage(2);
        setSettingUp(loader);
        setLoading(false);
    };
    const importModpack = path => {
        setPage(4);
        setImportPath(path);
    };
    return <Pages value={page}>
        <PageItem value={0}>
            <Grid width="35%" height="100%" direction="vertical" background="$blackA2" justifyContent="space-between" css={{
                maxWidth: '35%',
                borderRight: '1px solid $secondaryBorder'
            }}>
                <InstanceList id={instance} onSelect={selectInstance}/>
                <Grid width="100%" padding={16} background="$secondaryBackground" alignItems="center" justifyContent="center">
                    <Button onClick={() => setPage(1)}>
                        <IconBiPlusLg size={14}/>
                        {t('app.mdpkm.buttons.add_instance')}
                    </Button>
                </Grid>
            </Grid>
            <InstancePage id={instance}/>
        </PageItem>
        <PageItem value={1}>
            <SelectInstanceType
                back={selectBackToHome}
                types={API.instanceTypes}
                loading={loading}
                chooseLoader={chooseLoader}
                importInstance={importInstance}
            />
        </PageItem>
        <PageItem value={2}>
            <LoaderSetup
                back={setupBackToSelect}
                loader={settingUp}
                install={installLoader}
                versions={loaderVersions}
            />
        </PageItem>
        <PageItem value={3}>
            <ModpackSetup back={setupBackToSelect} importModpack={importModpack}/>
        </PageItem>
        <PageItem value={4}>
            <ImportInstance path={importPath} back={setupBackToSelect}/>
        </PageItem>
    </Pages>;
};