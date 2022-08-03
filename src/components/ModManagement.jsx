import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { List, Search, Diamond, ArrowLeft, ArrowClockwise, CloudArrowDown } from 'react-bootstrap-icons';

import Mod from './Mod';
import Tabs from '/voxeliface/components/Tabs';
import Grid from '/voxeliface/components/Grid';
import Modal from './Modal';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import TabItem from '/voxeliface/components/Tabs/Item';
import ModSearch from './ModSearch';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import TextHeader from '/voxeliface/components/Typography/Header';
import InstanceMod from './InstanceMod';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';

import Patcher from '/src/common/plugins/patcher';
import Instances from '../common/instances';
export default Patcher.register(function ModManagement({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const canPopout = useSelector(state => state.settings['instances.modSearchPopout']);
    const [tab, setTab] = useState();
    const [items, setItems] = useState(instance.mods);
    const [filter, setFilter] = useState('');
    const [updates, setUpdates] = useState();
    const [updateChecking, setUpdateChecking] = useState(false);
    const checkForUpdates = () => {
        const Instance = Instances.getInstance(instanceId);
        setUpdateChecking(true);
        Instance.checkForUpdates().then(updates => {
            setUpdates(updates);
            setUpdateChecking(false);
        });
    };
    useEffect(() => {
        if (instance.mods && instance.mods !== items)
            setItems(instance.mods);
        if (!items) {
            setItems('loading');

            const Instance = Instances.getInstance(instanceId);
            Instance.getMods().then(mods => {
                Instance.mods = mods;
                Instance.updateStore();
            });
        }
    }, [items, instance]);
    useEffect(() => setItems(), [instanceId]);
    return <React.Fragment>
        <Tabs
            value={tab}
            onChange={event => setTab(event.target.value)}
            borderRadius={0}
            css={{
                height: '100%'
            }}
        >
            <TabItem name={t('app.mdpkm.instance_page.tabs.mods.tabs.manage')} icon={<List size={14}/>} value={0}>
                <Grid margin="4px 0" spacing={8} justifyContent="space-between">
                    <Grid direction="vertical">
                        <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                            {t('app.mdpkm.mod_management.title')}
                        </Typography>
                        <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
                            <TextTransition inline>
                                {items === 'loading' || !items ?
                                    t('app.mdpkm.common:states.loading') :
                                    t('app.mdpkm.mod_management.count', { val: items.length })
                                }
                            </TextTransition>
                        </Typography>
                    </Grid>
                    <Grid spacing={8}>
                        <TextInput
                            width={144}
                            value={filter}
                            onChange={setFilter}
                            placeholder={t('app.mdpkm.mod_management.search')}
                        />
                        <Button theme="secondary" onClick={() => setItems()} disabled={items === 'loading'}>
                            {items === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                            {t('app.mdpkm.common:actions.refresh')}
                        </Button>
                        <Button theme="accent" onClick={checkForUpdates} disabled={updateChecking}>
                            {updateChecking ? <BasicSpinner size={16}/> : <CloudArrowDown size={14}/>}
                            {t('app.mdpkm.mod_management.get_updates')}
                        </Button>
                    </Grid>
                </Grid>
                {Array.isArray(items) ? items.length === 0 ?
                    <React.Fragment>
                        <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                            {t('app.mdpkm.common:headers.empty_list')}
                        </Typography>
                        <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={0} css={{ display: 'block' }}>
                            Find some mods via the <b>Mod Search</b> tab!
                        </Typography>
                    </React.Fragment>
                : items.filter(({ id, name }) =>
                    id?.toLowerCase().includes(filter) ||
                    name?.toLowerCase().includes(filter)
                ).sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id)).map((mod, index) =>
                    <InstanceMod key={index} mod={mod} updates={updates} instanceId={instanceId}/>
                ) : <Spinner/>}
            </TabItem>
            <TabItem name={t('app.mdpkm.instance_page.tabs.mods.tabs.search')} icon={<Search/>} value={1}>
                {!canPopout && <ModSearch instanceId={instanceId}/>}
            </TabItem>
            <TabItem name={t('app.mdpkm.instance_page.tabs.essential')} icon={<Diamond size={14}/>} value={2} spacing={4} disabled={!instance.isModded}>
                <svg width="1266" height="183" viewBox="0 0 1266 183" xmlns="http://www.w3.org/2000/svg" style={{
                    width: 'fit-content',
                    height: '2rem',
                    margin: '.15rem 0 0'
                }}>
                    <path fill="var(--colors-primaryColor)" d="M267.221 66.13H190.341L187.086 83.955H260.556L256.061 107.05H182.436L178.406 127.355H256.836L252.031 152H139.501L160.891 41.33H272.026L267.221 66.13ZM364.761 74.655C365.174 69.7983 363.418 66.3367 359.491 64.27C355.668 62.1 349.881 61.015 342.131 61.015C332.624 61.015 325.908 62.6167 321.981 65.82C319.501 67.99 318.261 70.4183 318.261 73.105C318.261 75.3783 319.191 77.0317 321.051 78.065C323.014 79.0983 326.063 79.8733 330.196 80.39L367.086 84.575C377.213 85.7117 385.066 88.605 390.646 93.255C396.329 97.905 399.171 104.415 399.171 112.785C399.171 117.952 398.034 123.377 395.761 129.06C393.488 134.64 389.871 139.342 384.911 143.165C379.538 147.298 372.614 150.398 364.141 152.465C355.668 154.635 343.578 155.72 327.871 155.72C308.031 155.72 292.944 153.188 282.611 148.125C272.381 142.958 267.266 134.175 267.266 121.775C267.266 119.605 267.421 117.383 267.731 115.11H306.636L306.481 117.59C306.481 123.067 308.548 126.787 312.681 128.75C316.814 130.713 322.963 131.695 331.126 131.695C341.873 131.695 349.364 130.145 353.601 127.045C355.358 125.805 356.546 124.41 357.166 122.86C357.889 121.31 358.251 119.967 358.251 118.83C358.251 116.04 357.114 113.973 354.841 112.63C352.568 111.287 349.158 110.305 344.611 109.685L311.286 105.655C289.483 102.968 278.581 93.875 278.581 78.375C278.581 73.5183 279.563 68.765 281.526 64.115C283.593 59.3617 286.589 55.2283 290.516 51.715C295.786 47.1683 302.658 43.7067 311.131 41.33C319.604 38.85 330.919 37.61 345.076 37.61C384.136 37.61 403.666 48.3567 403.666 69.85C403.666 70.78 403.563 72.3817 403.356 74.655H364.761ZM503.262 74.655C503.675 69.7983 501.919 66.3367 497.992 64.27C494.169 62.1 488.382 61.015 480.632 61.015C471.125 61.015 464.409 62.6167 460.482 65.82C458.002 67.99 456.762 70.4183 456.762 73.105C456.762 75.3783 457.692 77.0317 459.552 78.065C461.515 79.0983 464.564 79.8733 468.697 80.39L505.587 84.575C515.714 85.7117 523.567 88.605 529.147 93.255C534.83 97.905 537.672 104.415 537.672 112.785C537.672 117.952 536.535 123.377 534.262 129.06C531.989 134.64 528.372 139.342 523.412 143.165C518.039 147.298 511.115 150.398 502.642 152.465C494.169 154.635 482.079 155.72 466.372 155.72C446.532 155.72 431.445 153.188 421.112 148.125C410.882 142.958 405.767 134.175 405.767 121.775C405.767 119.605 405.922 117.383 406.232 115.11H445.137L444.982 117.59C444.982 123.067 447.049 126.787 451.182 128.75C455.315 130.713 461.464 131.695 469.627 131.695C480.374 131.695 487.865 130.145 492.102 127.045C493.859 125.805 495.047 124.41 495.667 122.86C496.39 121.31 496.752 119.967 496.752 118.83C496.752 116.04 495.615 113.973 493.342 112.63C491.069 111.287 487.659 110.305 483.112 109.685L449.787 105.655C427.984 102.968 417.082 93.875 417.082 78.375C417.082 73.5183 418.064 68.765 420.027 64.115C422.094 59.3617 425.09 55.2283 429.017 51.715C434.287 47.1683 441.159 43.7067 449.632 41.33C458.105 38.85 469.42 37.61 483.577 37.61C522.637 37.61 542.167 48.3567 542.167 69.85C542.167 70.78 542.064 72.3817 541.857 74.655H503.262ZM671.523 66.13H594.643L591.388 83.955H664.858L660.363 107.05H586.738L582.708 127.355H661.138L656.333 152H543.803L565.193 41.33H676.328L671.523 66.13ZM774.333 110.15L787.508 41.33H820.213L798.668 152H761.313L718.223 82.095H717.293L703.808 152H671.103L692.648 41.33H730.933L773.403 110.15H774.333ZM831.93 41.33H952.365L947.25 68.145H904.16L887.885 152H853.63L869.905 68.145H826.815L831.93 41.33ZM998.758 41.33L977.213 152H942.958L964.503 41.33H998.758ZM1134.39 152H1098.58L1093.78 133.71H1035.65L1024.18 152H985.433L1058.59 41.33H1103.23L1134.39 152ZM1076.11 69.85L1051.15 109.375H1087.27L1077.04 69.85H1076.11ZM1258.71 125.495L1253.6 152H1142.46L1163.85 41.33H1198.11L1181.99 125.495H1258.71Z"/>
                    <rect fill="var(--colors-primaryColor)" x="56.5684" y="40" width="80" height="80" transform="rotate(45 56.5684 40)"/>
                </svg>
                <Typography size=".8rem" color="$secondaryColor" margin="0 0 8px" weight={600} family="Nunito" textalign="start">
                    Essential is a quality of life mod that boosts Minecraft Java to the next level.<br/>
                    mdpkm is not endorsed by Essential.
                </Typography>
                <Mod id="essential-container" api="internal" featured instanceId={instanceId}/>
            </TabItem>
        </Tabs>
        {canPopout && tab === 1 && <Modal width="80%" height="69%">
            <Grid spacing={16}>
                <TextHeader>
                    <Search/>
                    Modification Search
                </TextHeader>
                <Button theme="accent" onClick={() => setTab(0)}>
                    <ArrowLeft size={14}/>
                    {t('app.mdpkm.common:actions.back')}
                </Button>
            </Grid>
            <ModSearch instanceId={instanceId}/>
        </Modal>}
    </React.Fragment>;
});