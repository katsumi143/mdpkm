import React from 'react';
import { useSelector } from 'react-redux';
import { BreakpointProvider } from 'react-socks';

import DefaultApp from '/voxeliface/components/App/Tauri';
export default function App(props) {
    const theme = useSelector(state => state.settings.theme);
    return (
        <BreakpointProvider>
            <DefaultApp
                title="mdpkm"
                theme={theme}
            {...props}/>
        </BreakpointProvider>
    );
};