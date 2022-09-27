import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import store from './common/store';

import App from './components/App';
import Main from '../voxeliface/components/Main';
import Image from '../voxeliface/components/Image';
import Spinner from '../voxeliface/components/Spinner';
import Typography from '../voxeliface/components/Typography';

import '/voxeliface/src/index.css';
let loadingState = 'Loading...';
let setLoadingState;
const useLoadingState = () => {
    const [state, setState] = useState(loadingState);
    useEffect(() => {
        setLoadingState = setState;
        return () => setLoadingState = null;
    });

    return state;
};

let Pages;
const AppContainer = () => {
    const state = useLoadingState();
    return <Provider store={store}>
        {state ? <App>
            <Main height="100vh" css={{
                gap: 16,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Image src="img/banners/brand_text.svg" width={192} height={60}/>
                <Spinner/>

                <Typography color="$secondaryColor" lineheight={1} css={{
                    left: 16,
                    bottom: 16,
                    position: 'absolute'
                }}>
                    {state}
                </Typography>
            </Main>
        </App> : <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Pages.Home/>}/>
                <Route exact path="/instance-splash" element={<Pages.InstanceSplash/>}/>
                <Route path="/*" element={<Pages.NotFound/>}/>
            </Routes>
        </BrowserRouter>}
    </Provider>;
};

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AppContainer/>
    </React.StrictMode>
);
console.log('react started');

const init = async() => {
    setLoadingState?.(loadingState = 'Loading localization files...');
    await import('./localization');

    setLoadingState?.(loadingState = 'Starting voxura...');
    await import('./common/voxura');

    setLoadingState?.(loadingState = 'Starting plugin system...');
    const { default: Plugins } = await import('./common/plugins');
    await Plugins.init().catch(console.warn);

    setLoadingState?.(loadingState = 'Loading user interface...');
    Pages = await import('./pages');

    setLoadingState?.();
};
init();