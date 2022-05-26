import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import * as Select from '/voxeliface/components/Input/Select';

import API from '../common/api';
import Util from '../common/util';
function sortGame(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        const versionA = a.split('.');
        const versionB = b.split('.');
    
        for (let i = 0; i < versionA.length; i++) {
            const verNumA = Number(versionA[i]) || 0;
            const verNumB = Number(versionB[i]) || 0;
    
            if (verNumA !== verNumB) {
                return verNumB - verNumA;
            }
        }
    }
  
    return 0;
}

function sortForge(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        const versionA = a.split(/-|\+/)[1].split('.');
        const versionB = b.split(/-|\+/)[1].split('.');
    
        for (let i = 0; i < versionA.length; i++) {
            const verNumA = Number(versionA[i]) || 0;
            const verNumB = Number(versionB[i]) || 0;
    
            if (verNumA !== verNumB) {
                return verNumB - verNumA;
            }
        }
    }
  
    return 0;
}

export default function LoaderSetup({ back, loader, install, versions = [] }) {
    const { t } = useTranslation();
    const loaderData = API.getLoader(loader);
    const loaderVersions = Array.isArray(versions) ? null : versions;
    if(!Array.isArray(versions))
        for (const [key, value] of Object.entries(loaderVersions)) {
            loaderVersions[key] = value.sort(loader === "forge" ? sortForge : _ => 0);
        }

    const [name, setName] = useState('');
    const [gameType, setGameType] = useState(Array.isArray(versions) ? versions.find(v => v.data.length > 0) : null);
    const [installState, setInstallState] = useState();
    const [gameVersions, setGameVersions] = useState(Array.isArray(versions) ?
        gameType?.data :
        Object.keys(versions).sort(sortGame));
    const [gameVersion, setGameVersion] = useState(
        Array.isArray(versions) ? gameVersions[0].value : gameVersions[0]
    );
    const [loaderVersion, setLoaderVersion] = useState(
        Array.isArray(versions) ? null : loaderVersions[gameVersions[0]][0]
    );
    const installLoader = () => install(name, loader, gameVersion, loaderVersion, setInstallState);
    return (
        <Grid width="100%" direction="vertical" alignItems="center">
            <Grid width="100%" padding="1rem 0" spacing={8} direction="vertical" alignItems="center" css={{
                borderBottom: '1px solid $tagBorder'
            }}>
                <Typography size="1.2rem" color="$primaryColor" family="Raleway" lineheight={1}>
                    Adding New Instance
                </Typography>
                <Typography size=".9rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                    Configure Loader
                </Typography>
            </Grid>
            <Grid width="100%" height="-webkit-fill-available" direction="vertical" alignItems="center" justifyContent="center" css={{
                overflow: 'auto'
            }}>
                <Image src={loaderData?.banner} width="100%" height="3.5rem"/>
                {installState && <React.Fragment>
                    <Typography size="1.1rem" color="$primaryColor" margin="1rem 0 0">
                        Installing {Util.getLoaderName(loader)} for {gameVersion}
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} margin="4px 0 0">
                        Your instance is called '{name}'
                    </Typography>
                </React.Fragment>}

                {!installState && <Grid margin="2rem 0 0 0" spacing={4} direction="vertical">
                    <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                        Instance Name
                    </Typography>
                    <TextInput
                        width={210}
                        value={name}
                        onChange={setName}
                    />
                </Grid>}

                {installState ? null : loaderVersions ?
                    <Grid width={210} margin="24px 0 0 0" spacing={4} direction="vertical">
                        <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                            Minecraft Version
                        </Typography>
                        <Select.Root
                            value={gameVersion}
                            onChange={v => {
                                setGameVersion(v);
                                setLoaderVersion(loaderVersions[v][0]);
                            }}
                        >
                            <Select.Group name="Minecraft Versions">
                                {gameVersions.map((version, index) =>
                                    <Select.Item key={index} value={version}>
                                        {version}
                                    </Select.Item>
                                )}
                            </Select.Group>
                        </Select.Root>
                    </Grid> :
                    <React.Fragment>
                        <Grid width={210} margin="16px 0 0 0" spacing={4} direction="vertical">
                            <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                                Version Category
                            </Typography>
                            <Select.Root
                                value={gameType}
                                onChange={v => {
                                    setGameType(v);
                                    setGameVersion(v.data[0].value);
                                    setGameVersions(v.data);
                                }}
                            >
                                <Select.Group name="Version Categories">
                                    {versions.map((type, index) =>
                                        <Select.Item key={index} value={type}>
                                            {type.name}
                                        </Select.Item>
                                    )}
                                </Select.Group>
                            </Select.Root>
                        </Grid>
                        <Grid width={210} margin="16px 0 0 0" spacing={4} direction="vertical">
                            <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                                Minecraft Version
                            </Typography>
                            <Select.Root
                                value={gameVersion}
                                onChange={setGameVersion}
                            >
                                <Select.Group name="Minecraft Versions">
                                    {gameVersions.map(({ name, value }, index) =>
                                        <Select.Item key={index} value={value}>
                                            {name}
                                        </Select.Item>
                                    )}
                                </Select.Group>
                            </Select.Root>
                        </Grid>
                    </React.Fragment>
                }

                {installState ? null : loaderVersions && <Grid width={210} margin="16px 0" spacing={4} direction="vertical">
                    <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                        Loader Version
                    </Typography>
                    <Select.Root
                        value={loaderVersion}
                        onChange={setLoaderVersion}
                    >
                        <Select.Group name="Loader Versions">
                            {loaderVersions[gameVersion].map((version, index) =>
                                <Select.Item key={index} value={version}>
                                    {version.includes("-") ? version.split("-")[1] : version}
                                </Select.Item>
                            )}
                        </Select.Group>
                    </Select.Root>
                </Grid>}
            </Grid>
            <Grid width="100%" padding={16} justifyContent="space-between" css={{
                borderTop: `${installState ? 4 : 1}px solid $tagBorder`,
                transition: 'border 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                borderImage: installState ? `linear-gradient(to right, #73c280 50%, $headerBackground 50%) 100% 1` : null
            }}>
                {installState ?
                    <Typography size="1.1rem" color="$primaryColor" weight={600} family="Nunito">
                        {installState}
                    </Typography>
                :
                    <Button theme="secondary" onClick={back}>
                        <ArrowLeft size={14}/>
                        {t('common:app.mdpkm.common.buttons.back_to_selection')}
                    </Button>
                }
                <Grid spacing={8}>
                    <Button onClick={installLoader} disabled={!name || !!installState}>
                        Install {Util.getLoaderName(loader)}
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};