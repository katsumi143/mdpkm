import React, { useState } from 'react';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Select from '/voxeliface/components/Input/Select';
import Spinner from '/voxeliface/components/Spinner';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import SelectItem from '/voxeliface/components/Input/SelectItem';

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

export default function LoaderSetup({ loader, install, versions, backButton }) {
    const loaderVersions = Array.isArray(versions) ? null : versions;
    if(!Array.isArray(versions))
        for (const [key, value] of Object.entries(loaderVersions)) {
            loaderVersions[key] = value.sort(loader === "forge" ? sortForge : _ => 0);
        }

    const [name, setName] = useState('');
    const [gameType, setGameType] = useState(Array.isArray(versions) ? versions[0] : null);
    const [installState, setInstallState] = useState();
    const [gameVersions, setGameVersions] = useState(Array.isArray(versions) ?
        versions[0].data :
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
            <Grid width="100%" height="-webkit-fill-available" direction="vertical" alignItems="center" justifyContent="center" css={{
                overflow: 'auto'
            }}>
                <Image src={{
                    java: "java-banner.svg",
                    forge: "forge-banner.png",
                    quilt: "quilt-banner.svg",
                    fabric: "fabric-icon.png",
                    bedrock: "franchise-banner.svg"
                }[loader]} width="100%" height="3.5rem"/>
                {installState && <React.Fragment>
                    <Typography size="1.1rem" color="$primaryColor" margin="1rem 0 0">
                        Installing {Util.getLoaderName(loader)} for {gameVersion}
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} margin="4px 0 0">
                        Your instance is called '{name}'
                    </Typography>
                </React.Fragment>}

                {!installState && <Grid margin="2rem 0 0 0" spacing="4px" direction="vertical">
                    <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                        Instance Name
                    </Typography>
                    <TextInput
                        width="210px"
                        value={name}
                        onChange={event => setName(event.target.value)}
                    />
                </Grid>}

                {installState ? null : loaderVersions ?
                    <Grid margin="24px 0 0 0" spacing="4px" direction="vertical">
                        <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                            Minecraft Version
                        </Typography>
                        <Select
                            value={gameVersion}
                            onChange={({ target }) => {
                                setGameVersion(target.value);
                                setLoaderVersion(loaderVersions[target.value][0]);
                            }}
                        >
                            {gameVersions.map((version, index) =>
                                <SelectItem key={index} value={version}>
                                    {version}
                                </SelectItem>
                            )}
                        </Select>
                    </Grid> :
                    <React.Fragment>
                        <Grid margin="16px 0 0 0" spacing="4px" direction="vertical">
                            <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                                Release Category
                            </Typography>
                            <Select
                                value={gameType}
                                onChange={({ target }) => {
                                    setGameType(target.value);
                                    setGameVersion(target.value.data[0].value);
                                    setGameVersions(target.value.data);
                                }}
                            >
                                {versions.map((type, index) =>
                                    <SelectItem key={index} value={type}>
                                        {type.name}
                                    </SelectItem>
                                )}
                            </Select>
                        </Grid>
                        <Grid margin="16px 0 0 0" spacing="4px" direction="vertical">
                            <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                                Minecraft Version
                            </Typography>
                            <Select
                                value={gameVersion}
                                onChange={({ target }) => setGameVersion(target.value)}
                            >
                                {gameVersions.map(({ name, value }, index) =>
                                    <SelectItem key={index} value={value}>
                                        {name}
                                    </SelectItem>
                                )}
                            </Select>
                        </Grid>
                    </React.Fragment>
                }

                {installState ? null : loaderVersions && <Grid margin="16px 0" spacing="4px" direction="vertical">
                    <Typography size={14} color="$secondaryColor" weight={400} family="Nunito">
                        Loader Version
                    </Typography>
                    <Select
                        value={loaderVersion}
                        onChange={({ target }) => setLoaderVersion(target.value)}
                    >
                        {loaderVersions[gameVersion].map((version, index) =>
                            <SelectItem key={index} value={version}>
                                {version.includes("-") ? version.split("-")[1] : version}
                            </SelectItem>
                        )}
                    </Select>
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
                : backButton}
                <Grid spacing={8}>
                    <Button onClick={installLoader} disabled={!name || !!installState}>
                        Install {Util.getLoaderName(loader)}
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};