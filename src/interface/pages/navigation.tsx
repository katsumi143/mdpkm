import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import App from '../components/App';
import Home from './home';
import Main from '../../../voxeliface/components/Main';
import Skins from './skins';
import Create from './create';
import Import from './import';
import Header from '../components/Header';
import Settings from './settings';
import Accounts from './accounts';
import Downloads from './downloads';
import Instances from './instances';
import Developer from './developer';
import SideNavigation from '../../../voxeliface/components/SideNavigation';
import NavigationItem from '../../../voxeliface/components/SideNavigation/Item';

import { setPage } from '../../store/slices/interface';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
export default function Navigation() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const page = useAppSelector(state => state.interface.page);

    const changePage = (page: string) => dispatch(setPage(page));
    return <App>
        <Header/>
        <Main css={{
            padding: 0,
            overflow: 'hidden auto',
            flexDirection: 'row'
        }}>
            <SideNavigation value={page} onChange={changePage} css={{
                '& > *:first-child': {
                    display: SHOULD_HIDE_SIDE.some(p => p === page) ? 'none' : undefined
                }
            }}>
                <NavigationItem name={t('app.mdpkm.home.navigation.home')} icon={<IconBiHouse/>} value="home" direction="horizontal">
                    <Home/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.instances')} icon={<IconBiListUl/>} value="instances" direction="horizontal">
                    <Instances/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.skins')} icon={<IconBiPersonBadge/>} value="skins">
                    <Skins/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.import')} icon={null} value="import" hidden>
                    <Import/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.create')} icon={null} value="create" hidden>
                    <Create/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.developer')} icon={<IconBiWrenchAdjustableCircle/>} value="developer" hidden footer>
                    <Developer/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.downloads')} icon={<IconBiDownload/>} value="downloads" footer>
                    <Downloads/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.accounts')} icon={<IconBiPerson/>} value="accounts" footer>
                    <Accounts/>
                </NavigationItem>
                <NavigationItem name={t('app.mdpkm.home.navigation.settings')} icon={<IconBiGear/>} value="settings" footer>
                    <Settings/>
                </NavigationItem>
            </SideNavigation>
            <Toaster position="bottom-right"/>
        </Main>
    </App>;
};

const SHOULD_HIDE_SIDE = ['import', 'create'];