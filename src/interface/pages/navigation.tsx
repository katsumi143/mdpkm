import React from 'react';
import { styled } from '@stitches/react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Main, SideNavigation, NavigationItem } from 'voxeliface';

import App from '../components/App';
import Home from './home';
import Skins from './skins';
import Create from './create';
import Import from './import';
import Search from './search';
import Header from '../components/Header';
import Settings from './settings';
import Accounts from './accounts';
import Downloads from './downloads';
import Instances from './instances';
import Developer from './developer';
import AppUpdate from '../components/AppUpdate';
import EulaDialog from '../components/EulaDialog';
import LaunchError from '../components/LaunchError';
import ImagePreview from '../components/ImagePreview';

import { setPage, setImagePreview } from '../../store/slices/interface';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
export default function Navigation() {
    const { t } = useTranslation('interface');
    const page = useAppSelector(state => state.interface.page);
	const dispatch = useAppDispatch();
	const appUpdate = useAppSelector(state => state.interface.appUpdate);
	const launchError = useAppSelector(state => state.interface.launchError);
	const imagePreview = useAppSelector(state => state.interface.imagePreview);
	const showEulaDialog = useAppSelector(state => state.interface.mcServerEulaDialog);

	const changePage = (page: string) => dispatch(setPage(page));
	const closePreview = () => dispatch(setImagePreview(null));
    return <App css={{ background: '$primaryBackground' }}>
		<Container onContextMenu={event => event.preventDefault()}>
			<Header/>
			<Main css={{
				padding: 0,
				overflow: 'hidden'
			}}>
				<SideNavigation value={page} onChange={changePage} css={{
					'& > *:first-child': {
						display: SHOULD_HIDE_SIDE.some(p => p === page) ? 'none' : undefined
					}
				}}>
					<NavigationItem name={t('navigation.home')} icon={<IconBiHouse/>} value="home">
						<Home/>
					</NavigationItem>
					<NavigationItem name={t('instance_list')} icon={<IconBiListUl/>} value="instances" direction="horizontal">
						<Instances/>
					</NavigationItem>
					<NavigationItem name={t('navigation.skins')} icon={<IconBiPersonBadge/>} value="skins">
						<Skins/>
					</NavigationItem>
					<NavigationItem name={t('navigation.import')} icon={null} value="import" hidden>
						<Import/>
					</NavigationItem>
					<NavigationItem name={t('navigation.create')} icon={null} value="create" hidden>
						<Create/>
					</NavigationItem>
					<NavigationItem name={t('navigation.search')} icon={null} value="search" hidden>
						<Search/>
					</NavigationItem>
					<NavigationItem name={t('navigation.developer')} icon={<IconBiWrenchAdjustableCircle/>} value="developer" hidden footer>
						<Developer/>
					</NavigationItem>
					<NavigationItem name={t('navigation.downloads')} icon={<IconBiDownload/>} value="downloads" footer>
						<Downloads/>
					</NavigationItem>
					<NavigationItem name={t('navigation.accounts')} icon={<IconBiPerson/>} value="accounts" footer>
						<Accounts/>
					</NavigationItem>
					<NavigationItem name={t('navigation.settings')} icon={<IconBiGear/>} value="settings" footer>
						<Settings/>
					</NavigationItem>
				</SideNavigation>
				<Toaster position="bottom-right"/>
			</Main>
			{appUpdate && <AppUpdate update={appUpdate}/>}
			{launchError && <LaunchError data={launchError}/>}
			{imagePreview && <ImagePreview {...imagePreview} onClose={closePreview}/>}
			{showEulaDialog && <EulaDialog instanceId={showEulaDialog}/>}
		</Container>
    </App>;
}

const Container = styled('div', {
	width: '100vw',
	height: '100vh',
	display: 'flex',
	flexDirection: 'column'
});

export const SHOULD_HIDE_SIDE = ['import', 'create', 'search'];