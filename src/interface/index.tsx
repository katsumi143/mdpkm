import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import store from '../store';
import Navigation from './pages/navigation';

import 'voxeliface/style.css';
export function AppContainer() {
    return <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigation/>}/>
            </Routes>
        </BrowserRouter>
    </Provider>;
}

const root = createRoot(document.getElementById('root')!);
root.render(<AppContainer/>);