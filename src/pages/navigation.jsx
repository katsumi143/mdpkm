import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import App from '../components/App';
import Home from './home';
import Main from '/voxeliface/components/Main';
import Skins from './skins';
import Header from '../components/Header';
import Settings from './settings';
import Accounts from './accounts';
import Downloads from './downloads';
import Instances from './instances';
import SideNavigation from '/voxeliface/components/SideNavigation';
import NavigationItem from '/voxeliface/components/SideNavigation/Item';

export default function Navigation() {
    const { t } = useTranslation();
    const [page, setPage] = useState(0);

    return <App>
        <Header/>
        <Main css={{
            padding: 0,
            overflow: 'hidden auto',
            flexDirection: 'row'
        }}>
            <SideNavigation value={page} onChange={setPage}>
                <NavigationItem name={t('app.mdpkm.home.navigation.home')} icon={<IconBiHouse size={16}/>} value={0} direction="horizontal">
                    <Home/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.instances')} icon={<IconBiListUl size={16}/>} value={1} direction="horizontal">
                    <Instances/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.skins')} icon={<IconBiPersonBadge size={16}/>} value={2}>
                    <Skins/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.downloads')} icon={<IconBiDownload size={16}/>} value={3} footer>
                    <Downloads/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.accounts')} icon={<IconBiPerson size={16}/>} value={4} footer>
                    <Accounts/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.settings')} icon={<IconBiGear size={16}/>} value={5} footer>
                    <Settings/>
                </NavigationItem>
            </SideNavigation>
            <Toaster position="bottom-right"/>
        </Main>
    </App>;
};