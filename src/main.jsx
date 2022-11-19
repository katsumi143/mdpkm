import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import store from './store';

import App from './interface/components/App';
import Main from '../voxeliface/components/Main';
import Image from '../voxeliface/components/Image';
import Spinner from '../voxeliface/components/Spinner';
import Typography from '../voxeliface/components/Typography';

import '/voxeliface/src/style.css';
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

let Navigation;
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
                <Route exact path="/" element={<Navigation/>}/>
            </Routes>
        </BrowserRouter>}
    </Provider>;
};

const root = createRoot(document.getElementById('root'));
root.render(<AppContainer/>);
console.log('react started');

if (import.meta.hot)
    import.meta.hot.accept('./pages/navigation', nav => {
        Navigation = nav?.default;
    });

const init = async() => {
    setLoadingState?.(loadingState = 'Loading localization files...');
    await import('./localization');

    setLoadingState?.(loadingState = 'Starting plugin system...');
    const { default: PluginSystem } = await import('./plugins');
    await PluginSystem.init().catch(console.warn);

    setLoadingState?.(loadingState = 'Starting voxura...');
    await import('./voxura');

    setLoadingState?.(loadingState = 'Loading user interface...');
    Navigation = await import('./interface/pages/navigation').then(p => p.default);

    setLoadingState?.();
};
init();