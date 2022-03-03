import React from 'react';
import { styled } from '@stitches/react';
import { Tag, App as AppIcon, PlusLg, PlayFill, GearFill, ArrowLeft, Folder2Open, XCircleFill, CheckCircleFill } from 'react-bootstrap-icons';

import App from '../components/uiblox/App';
import Main from '../components/uiblox/Main';
import Tabs from '../components/uiblox/Tabs';
import Grid from '../components/uiblox/Grid';
import Image from '../components/uiblox/Image';
import Input from '../components/uiblox/Input';
import Table from '../components/uiblox/Table';
import Header from '../components/uiblox/Header';
import Button from '../components/uiblox/Button';
import Select from '../components/uiblox/Input/Select';
import Spinner from '../components/uiblox/Spinner';
import Typography from '../components/uiblox/Typography';
import SelectItem from '../components/uiblox/Input/SelectItem';
import LoaderSetup from '../components/LoaderSetup';
import BasicSpinner from '../components/uiblox/BasicSpinner';

import Modpack from '../components/Modpack';
import Instance from '../components/Instance';
import ModpackListPage from '../components/ModpackListPage';
import SelectInstanceType from '../components/SelectInstanceType';

import API from '../common/api';
import Util from '../common/util';
import Instances from '../common/instances';
import { FORGE_VERSION_MANIFEST, FABRIC_API_BASE } from '../common/constants';

import toast, { Toaster } from 'react-hot-toast';

const Tauri = window.__TAURI__;

const ModpackListing = styled(Grid, {
    overflow: "hidden auto"
});

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settingUp: '',
            instances: null,
            searching: false,
            instanceTab: 0,
            modpackSearch: '',
            hideInstances: false,
            instanceModTab: 0,
            selectingInstance: false
        };
    }

    render() {
        console.log(this.state);
        return (
            <App>
                <Header icon="/text.png" />
                <Grid height="100%" direction="horizontal">
                    <Grid width="35%" height="100%" direction="vertical" background="#0000001c" justifyContent="space-between" style={{
                        opacity: this.state.hideInstances ? 0 : 1,
                        maxWidth: this.state.hideInstances ? "0%" : "35%",
                        maxHeight: "calc(100vh - 64px)",
                        transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                        pointerEvents: this.state.hideInstances ? "none" : "unset"
                    }}>
                        <Grid spacing="8px" direction="vertical" alignItems="center" style={{
                            overflowY: "auto"
                        }}>
                            <Grid width="100%" height="48px" background="#0000002e" alignItems="center" justifyContent="center">
                                <Typography text="Instances" size="1.1rem" weight={400}/>
                            </Grid>
                            {this.state.instances && this.state.instances.map((instance, index) => {
                                return (
                                    <Instance key={index} data={instance} onView={_ => this.selectInstance(index)} />
                                );
                            })}
                            {!this.state.instances && <Spinner/>}
                        </Grid>
                        <Grid width="100%" height="64px" spacing="1rem" background="#0000002e" alignItems="center" justifyContent="center">
                            <Button onClick={_ => this.addNewInstance()}>
                                <PlusLg/>
                                Add New Instance
                            </Button>
                            <Button theme="secondary" disabled>
                                <GearFill/>
                                Settings
                            </Button>
                        </Grid>
                    </Grid>
                    <Main width={`calc(100vw - ${this.state.hideInstances ? "0%" : "35%"})`} style={{
                        overflow: "hidden auto"
                    }}>
                        {
                            this.state.searchAPI &&
                            <ModpackListing width="inherit" padding="0 16px" direction="vertical" spacing="8px" alignItems="center">
                                <Grid width="100%" margin="8px 0 0 0" alignItems="center" justifyContent="space-between">
                                    <Grid margin="16px" spacing="1rem" alignItems="center">
                                        <Image src={{ CurseForge: "/curseforge-icon.svg" }[this.state.settingUp]} size="2rem"/>
                                        <Typography text="Modpack Browser" size="1.2rem" weight={600} family="Nunito, sans-serif" />
                                    </Grid>
                                    <Grid spacing="8px" alignItems="center">
                                        <Typography text="Category" size="0.9rem" />
                                        <Select
                                            value={this.state.modpackSearchCategory}
                                            onChange={event => this.setState({ modpackSearchCategory: event.target.value })}
                                        >
                                            {this.state.modpackSearchCategories &&
                                                this.state.modpackSearchCategories.map(({ id, name, icon }, index) =>
                                                    <SelectItem key={index} value={id}>
                                                        {icon && <Image src={icon} size="24px" borderRadius="4px"/>}
                                                        {name}
                                                    </SelectItem>
                                                )
                                            }
                                        </Select>
                                    </Grid>
                                </Grid>
                                <Grid width="100%" margin="-8px 0 8px 16px" alignItems="center" justifyContent="space-between">
                                    <Grid alignItems="center">
                                        <Input
                                            value={this.state.modpackSearch}
                                            onBlur={_ => this.searchModpacks()}
                                            onChange={(event) => this.setState({
                                                modpackSearch: event.target.value
                                            })}
                                            placeholder="Search for Modpacks"
                                        />
                                    </Grid>
                                    <Grid spacing="8px" alignItems="center">
                                        <Typography text="Version" size="0.9rem" />
                                        <Select
                                            value={this.state.modpackSearchVersion}
                                            onChange={event => this.setState({ modpackSearchVersion: event.target.value })}
                                        >
                                            {this.state.modpackSearchVersions &&
                                                this.state.modpackSearchVersions.map(({ id, name }, index) =>
                                                    <SelectItem key={index} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                )
                                            }
                                        </Select>
                                    </Grid>
                                </Grid>
                                {this.state.searching && <Spinner />}
                                {!this.state.searching && this.state.modpacks?.map((modpack, index) => {
                                    return <Modpack key={index} data={modpack} buttons={<React.Fragment>
                                        {modpack.hasHTMLSummary &&
                                            <Button theme="secondary" onClick={_ => this.selectModpack(modpack)}>
                                                More Info
                                            </Button>
                                        }
                                        <Button onClick={_ => this.installModpack(modpack)}>
                                            Install
                                        </Button>
                                    </React.Fragment>} selected={this.state.selectedModpack === modpack}/>
                                })}
                                <Typography text="There's nothing here!" size="1.2rem" margin="8px 0 0 0" />
                                <Typography text="Maybe try waiting." size="1rem" margin="4px 0 24px 0" color="#cbcbcb" />
                            </ModpackListing>
                        }
                        {
                            this.state.selectingInstance &&
                            <SelectInstanceType settingUp={this.state.settingUp} types={[
                                "divide:Supported by Mojang Studios",
                                ["Minecraft Java Edition", "Simply Vanilla Minecraft, no mods or anything special.",
                                    "/minecraft-icon.png",
                                    <React.Fragment>
                                        <Button onClick={_ => this.setupLoader("forge")} disabled>
                                            {this.state.loading && <BasicSpinner size={16}/>}
                                            Continue
                                        </Button>
                                    </React.Fragment>,
                                    "coming soon"
                                ],
                                "divide:Third Party Modpacks",
                                ["CurseForge Modpacks", "Modpacks created by CurseForge Users.",
                                    "/curseforge-icon.svg",
                                    <React.Fragment>
                                        <Button theme="secondary" disabled>Import ZIP</Button>
                                        <Button onClick={_ => this.setSPU("CurseForge").loadModpackSearch(API.CurseForge.Modpacks)} disabled={this.state.loading}>
                                            {this.state.loading && <BasicSpinner size={16}/>}
                                            Search
                                        </Button>
                                    </React.Fragment>
                                ],
                                ["Feed The Beast Modpacks", "Modpacks created by the FTB Group.",
                                    "/ftb-icon.png",
                                    <React.Fragment>
                                        <Button onClick={_ => this.setSPU("FeedTheBeast").loadModpackSearch(API.FeedTheBeast.Modpacks)} disabled={this.state.loading}>
                                            {this.state.loading && <BasicSpinner size={16}/>}
                                            Search
                                        </Button>
                                    </React.Fragment>,
                                    "experimental"
                                ],
                                ["Modrinth Modpacks", "Modpacks created by Modrinth Users.",
                                    "/modrinth-icon.svg",
                                    <React.Fragment>
                                        <Button onClick={_ => this.setSPU("Modrinth")} disabled>
                                            {this.state.loading && <BasicSpinner size={16}/>}
                                            Search
                                        </Button>
                                    </React.Fragment>,
                                    "coming soon"
                                ],
                                "divide:Third Party Modloaders",
                                ["Forge Modloader", "Forge Description",
                                    "/forge-icon.svg",
                                    <React.Fragment>
                                        <Button onClick={_ => this.setupLoader("forge")} disabled={this.state.loading}>
                                            {this.state.loading && <BasicSpinner size={16}/>}
                                            Continue
                                        </Button>
                                    </React.Fragment>,
                                    "unstable"
                                ],
                                ["Fabric Loader", "Fabric is a lightweight, experimental modding toolchain.",
                                    "/fabric-icon.png",
                                    <React.Fragment>
                                        <Button onClick={_ => this.setupLoader("fabric")} disabled={this.state.loading}>
                                            {this.state.loading && <BasicSpinner size={16}/>}
                                            Continue
                                        </Button>
                                    </React.Fragment>,
                                    "experimental"
                                ],
                                ["Quilt Loader", "The Quilt project is a community-driven modding toolchain.",
                                    "/quilt-icon.svg",
                                    <React.Fragment>
                                        <Button onClick={_ => this.setupLoader("quilt")} disabled>
                                            Continue
                                        </Button>
                                    </React.Fragment>,
                                    "coming soon"
                                ],
                            ]} backButton={
                                <Button theme="secondary" style={{ left: 16, bottom: 16, position: "fixed" }} onClick={_ => this.setState({ hideInstances: false, selectingInstance: false })}>
                                    <ArrowLeft/>
                                    Back To Instances
                                </Button>
                            }/>
                        }
                        {
                            this.state.loaderVersions && this.state.settingUp &&
                            <LoaderSetup loader={this.state.settingUp} install={this.installLoader.bind(this)} versions={this.state.loaderVersions} backButton={
                                <Button theme="secondary" style={{ left: 16, bottom: 16, position: "fixed" }} onClick={_ => this.setSPU(undefined).setState({ hideInstances: false, selectingInstance: false })}>
                                    <ArrowLeft/>
                                    Back To Instances
                                </Button>
                            }/>
                        }
                        {
                            this.state.selectedInstance !== undefined ? (_ => {
                                const DescriptionList = styled(Grid, {
                                    overflow: "hidden scroll"
                                });
                                const instance = this.state.instances[this.state.selectedInstance];
                                const { mods, config } = instance;

                                return <Grid width="100%" height="100%" direction="vertical">
                                    <Grid width="100%" margin="16px 0 0 16px" direction="horizontal" alignItems="flex-start">
                                        {Util.getInstanceIcon(instance, 96)}
                                        <Grid width="100%" margin="0 0 0 16px" direction="vertical" alignItems="flex-start">
                                            <Grid width="100%" padding="0 48px 0 0" direction="horizontal" alignItems="flex-start">
                                                <Grid width="100%" direction="vertical" alignItems="flex-start" justifyContent="space-between">
                                                    <Typography text={instance.name} size="1.2rem" textalign="start" />
                                                    <Typography text={instance.state ?? "Installed"} size="0.9rem" color="#ffffffba" family="Nunito" margin="-2px 0 0 0" />
                                                </Grid>
                                                <Grid spacing="8px">
                                                    <Button theme="secondary" onClick={_ => this.openInstanceFolder(instance)}>
                                                        <Folder2Open/>
                                                        Open
                                                    </Button>
                                                    <Button onClick={_ => this.launchInstance(instance)} disabled={!!instance.state}>
                                                        {!instance.state ? <PlayFill/> : <BasicSpinner size={16}/>}
                                                        Launch
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            <Grid margin="8px 0 0 0" spacing="24px" direction="horizontal">
                                                <Grid spacing="12px" direction="horizontal" alignItems="center">
                                                    <AppIcon color="#cbcbcb" size="1.3rem"/>
                                                    <Grid direction="vertical" alignItems="flex-start">
                                                        <Typography text="Loader" size="0.9rem" color="#cbcbcb" weight={600} />
                                                        <Typography text={instance.config.loader.type} size="0.9rem" className="inter" />
                                                    </Grid>
                                                </Grid>
                                                <Grid spacing="12px" direction="horizontal" alignItems="center">
                                                    <Tag color="#cbcbcb" size="1.3rem"/>
                                                    <Grid direction="vertical" alignItems="flex-start">
                                                        <Typography text="Game Version" size="0.9rem" color="#cbcbcb" weight={600} />
                                                        <Typography text={instance.config.loader.game} size="0.9rem" className="inter" />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <DescriptionList width="100%" height="100%" padding="16px" direction="vertical" alignItems="flex-start" spacing="8px" style={{
                                        overflow: "hidden scroll"
                                    }}>
                                        <Tabs 
                                            tabs={[
                                                ["Modifications", 0],
                                                ["Essential", 2],
                                                ["Settings", 3]
                                            ]}
                                            pages={[
                                                [0, <React.Fragment>
                                                    <Tabs 
                                                        tabs={[
                                                            ["Installed", 0],
                                                            ["Mod Search", 2]
                                                        ]}
                                                        pages={[
                                                            [0, <React.Fragment>
                                                                {mods ?
                                                                    <Table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>
                                                                                    Name
                                                                                </th>
                                                                                <th>
                                                                                    Version
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {mods.map((mod, index) =>
                                                                                <tr key={index}>
                                                                                    <td style={{
                                                                                        gap: "1rem",
                                                                                        display: "flex",
                                                                                        alignItems: "center"
                                                                                    }}>
                                                                                        <Image src={mod.icon ? `data:image/png;base64,${mod.icon}` : ""} size={32} background="#ffffff12" borderRadius="8.33333333%"/>
                                                                                        {mod.name ?? mod.id}
                                                                                    </td>
                                                                                    <td>
                                                                                        {mod.version}
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </Table>
                                                                :
                                                                    <Spinner/>
                                                                }
                                                            </React.Fragment>, true, true],
                                                            [2, <Grid direction="vertical">
                                                                
                                                            </Grid>]
                                                        ]}
                                                        value={this.state.instanceModTab}
                                                        onChange={event => this.setState({ instanceModTab: event.target.value })}
                                                    />
                                                </React.Fragment>, true],
                                                [2, <Grid margin="1rem 0 .6rem 0.6rem" direction="vertical">
                                                    <Image src="essential-banner.svg" width="100%" height="1.2rem" style={{
                                                        backgroundPosition: "left center"
                                                    }}/>
                                                    <Typography size=".8rem" color="#ffffff2e" weight={600} family="Nunito, sans-serif" style={{
                                                        marginTop: ".2rem"
                                                    }}>
                                                        mdpkm is not endorsed by Essential.
                                                    </Typography>
                                                    <Typography margin=".6rem 0" style={{
                                                        gap: "8px"
                                                    }} lineheight={0}>
                                                        {config.essential ?
                                                            <CheckCircleFill size="24px" color="#2bc552"/> :
                                                            <XCircleFill size="24px" color="#c5392b"/>
                                                        }
                                                        {config.essential ? `Installed` : 'Not Installed'}
                                                    </Typography>
                                                    <Grid margin=".4rem 0 0 0" spacing="8px">
                                                        <Button onClick={_ => this.installEssential(instance)} disabled={this.state.installingEssential || !!config.essential}>
                                                            Download
                                                        </Button>
                                                        <Button theme="secondary" onClick={_ => this.removeEssential(instance)} disabled={!config.essential}>
                                                            Remove
                                                        </Button>
                                                    </Grid>
                                                </Grid>],
                                                [3, <React.Fragment>
                                                    
                                                </React.Fragment>]
                                            ]}
                                            value={this.state.instanceTab}
                                            onChange={event => this.setState({ instanceTab: event.target.value })}
                                        />
                                        <Button onClick={_ => Tauri.path.resolve(instance.path).then(Tauri.clipboard.writeText)}>
                                            Copy Folder Path
                                        </Button>
                                    </DescriptionList>
                                </Grid>
                            })()
                                : <Grid />
                        }
                    </Main>
                </Grid>
                <Toaster/>
            </App>
        );
    }

    async componentDidMount() {
        if (!this.instances) {
            this.instances = await Instances.build();
            this.instances.on('changed', this.forceUpdate.bind(this));
            this.forceUpdate();
        }
    }

    async getSnapshotBeforeUpdate(prevProps, prevState) {
        if (this.instances)
            this._asyncInstances = this.instances.getInstances().then(instances => {
                this._asyncInstances = null;
                if (!prevState.instances || prevState.instances.length !== instances.length)
                    this.setState({
                        instances
                    });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        const changed = {};
        for (const [key, value] of Object.entries(prevState))
            if (value !== this.state[key])
                changed[key] = true;

        if (this.state.searchAPI)
            if (changed.modpackSearchVersion || changed.modpackSearchCategory)
                this.searchModpacks();
    }

    setSPU(name) {
        this.setState({
            settingUp: name
        });
        return this;
    }

    async setupLoader(name) {
        this.setState({
            loading: true
        });
        const versions = await API.makeRequest({
            fabric: `${FABRIC_API_BASE}/versions`,
            forge: FORGE_VERSION_MANIFEST
        }[name]);

        let ver = versions;
        switch(name) {
            case "fabric":
                ver = {};
                const loaders = versions.loader.map(y => y.version).reverse();
                for (const { version } of versions.game) {
                    ver[version] = loaders;
                }
                break;
        }
        this.setState({
            loading: false,
            settingUp: name,
            loaderVersions: ver
        });
    }

    searchModpacks() {
        const api = this.state.searchAPI;
        this.setState({
            modpacks: [],
            searching: true,
            selectedModpack: undefined
        });
        return api.get({
            query: this.state.modpackSearch,
            version: this.state.modpackSearchVersion ?? -1,
            category: this.state.modpackSearchCategory ?? 0
        }).then(modpacks => this.setState({
            modpacks,
            searching: false
        }));
    }

    async loadModpackSearch(api) {
        const versions = await api.getVersions();
        const categories = await api.getCategories();
        console.log(versions, categories);
        this.setState({
            searchAPI: api,
            modpackSearch: "",
            hideInstances: true,
            modpackSearchVersion: -1,
            modpackSearchVersions: [{
                id: -1,
                name: "All Versions",
                icon: null
            }, ...versions],
            modpackSearchCategory: 0,
            modpackSearchCategories: [{
                id: 0,
                name: "All Categories",
                icon: "/minecraft-icon-small.png"
            }, ...categories]
        });
        return this.searchModpacks();
    }

    async selectModpack(modpack) {
        await modpack.getHTMLDescription();
        this.setState({
            selectedModpack: this.state.selectedModpack === modpack ? undefined : modpack
        });
    }

    async selectInstance(instance) {
        const value = this.state.instances[instance];
        await value.getConfig();
        this.setState({
            hideInstances: false,
            selectedInstance: this.state.selectedInstance === instance ? undefined : instance
        });
    }

    closeModpackBrowser() {
        this.setState({
            modpacks: null,
            searchAPI: null,
            modpackSearch: null,
            modpackSearchVersion: null,
            modpackSearchCategory: 0
        });
    }

    installModpack(modpack) {
        this.closeModpackBrowser();
        this.setState({
            hideInstances: false,
            selectedModpack: undefined
        });
        this.instances.installModpack(modpack);
    }

    openInstanceFolder(instance) {
        Tauri.shell.open(instance.path);
    }

    async installEssential(instance) {
        this.setState({
            installingEssential: true
        });

        const { type, game } = instance.config.loader;
        switch (type) {
            case "forge":
                if (game === '1.12.2' || game === '1.8.9')
                    await toast.promise(
                        Util.downloadFile(`https://downloads.essential.gg/v1/mods/essential/container/updates/stable/forge_${game.replaceAll('.', '-')}?action=download`, `${instance.path}/mods`, true, `Essential Forge ${game}.jar`),
                        {
                            pending: `Installing Essential for Forge ${game}`,
                            success: 'Installed Essential Successfully',
                            error: 'Something went wrong!'
                        },
                        {
                            className: 'gotham',
                            position: 'bottom-right'
                        }
                    );
                else {
                    toast.error(`Essential is not available for Forge ${game}`, {
                        className: 'gotham',
                        position: 'bottom-right'
                    });
                    return this.setState({
                        installingEssential: false
                    });
                }
                break;
            case "fabric":
                if (game === '1.18.1' || game === '1.17.1')
                    await toast.promise(
                        Util.downloadFile(`https://downloads.essential.gg/v1/mods/essential/container/updates/stable/fabric_${game.replaceAll('.', '-')}?action=download`, `${instance.path}/mods`, true, `Essential Fabric ${game}.jar`),
                        {
                            pending: `Installing Essential for Fabric ${game}`,
                            success: 'Installed Essential Successfully',
                            error: 'Something went wrong!'
                        },
                        {
                            className: 'gotham',
                            position: 'bottom-right'
                        }
                    );
                else {
                    toast.error(`Essential is not available for Fabric ${game}`, {
                        className: 'gotham',
                        position: 'bottom-right'
                    });
                    return this.setState({
                        installingEssential: false
                    });
                }
                break;
            default:
                throw new Error("instance isn't forge or fabric");
        };

        const config = await instance.getConfig();
        config.essential = `${type}-${game}`;

        await instance.saveConfig(config);

        this.setState({
            installingEssential: false
        });
    }

    async removeEssential() {

    }

    addNewInstance() {
        this.setState({
            hideInstances: true,
            selectedInstance: undefined,
            selectingInstance: true
        });
    }

    launchInstance(instance) {
        return instance.launch();
    }

    installLoader(name, loader, gameVersion, loaderVersion) {
        this.setState({
            loader: undefined,
            settingUp: undefined,
            hideInstances: false,
            loaderVersions: undefined
        });
        return this.instances.installInstanceWithLoader(name, loader, gameVersion, loaderVersion);
    }
};