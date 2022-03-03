import React from 'react';
import { keyframes } from '@stitches/react';

import Grid from './uiblox/Grid';
import Image from './uiblox/Image';
import Input from './uiblox/Input';
import Button from './uiblox/Button';
import Select from './uiblox/Input/Select';
import Typography from './uiblox/Typography';
import SelectItem from './uiblox/Input/SelectItem';

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

function capit(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class LoaderSetup extends React.Component {
    constructor(props) {
        super(props);

        const { versions } = props;
        const gameVersions = Object.keys(versions).sort(sortGame);
        const loaderVersions = versions;
        this.state = {
            gameVersion: gameVersions[0],
            gameVersions,
            instanceName: "",
            loaderVersion: loaderVersions[gameVersions[0]].reverse()[0],
            loaderVersions
        };
    }

    render() {
        const { loader, install, backButton } = this.props;
        const sort = loader === "forge" ? sortForge : _ => 0;
        return (
            <Grid width="100%" padding="24px 0" spacing="16px" direction="vertical" alignItems="center" style={{
                top: 64,
                left: 0,
                position: "absolute"
            }}>
                {backButton}
                <Grid margin="2rem 0 0 0" direction="vertical" alignItems="center">
                    <Image src={{ forge: "/forge-banner.png", fabric: "fabric-icon.png" }[loader]} width="100%" height="3rem" style={{
                        marginTop: "4rem"
                    }}/>

                    <Grid margin="24px 0 0 0" spacing="4px" direction="vertical">
                        <Typography size="14px" color="#ffffff99" weight={400} family="Nunito, sans-serif">
                            Instance Name
                        </Typography>
                        <Input
                            width="210px"
                            value={this.state.instanceName}
                            onChange={event => this.setState({ instanceName: event.target.value })}
                        />
                    </Grid>

                    <Grid margin="24px 0 0 0" spacing="4px" direction="vertical">
                        <Typography size="14px" color="#ffffff99" weight={400} family="Nunito, sans-serif">
                            Minecraft Version
                        </Typography>
                        <Select
                            value={this.state.gameVersion}
                            onChange={event => this.setState({ gameVersion: event.target.value, loaderVersion: this.state.loaderVersions[event.target.value].reverse()[0] })}
                        >
                            {this.state.gameVersions.map((version, index) =>
                                <SelectItem key={index} value={version}>
                                    {version}
                                </SelectItem>
                            )}
                        </Select>
                    </Grid>

                    <Grid margin="16px 0" spacing="4px" direction="vertical">
                        <Typography size="14px" color="#ffffff99" weight={400} family="Nunito, sans-serif">
                            {capit(loader)} Version
                        </Typography>
                        <Select
                            value={this.state.loaderVersion}
                            onChange={event => this.setState({ loaderVersion: event.target.value })}
                        >
                            {this.state.loaderVersions[this.state.gameVersion].sort(sort).map((version, index) =>
                                <SelectItem key={index} value={version}>
                                    {version.includes("-") ? version.split("-")[1] : version}
                                </SelectItem>
                            )}
                        </Select>
                    </Grid>

                    <Button style={{
                        minWidth: 210
                    }} onClick={_ => install(this.state.instanceName, loader, this.state.gameVersion, this.state.loaderVersion)} disabled={!this.state.instanceName}>
                        Install {capit(loader)}
                    </Button>
                </Grid>
            </Grid>
        );
    }
};