import React from 'react';
import { useSelector } from 'react-redux';

import DefaultApp from '/voxeliface/components/App/Tauri';
export default function App(props) {
    const theme = useSelector(state => state.settings.theme);
    return (
        <DefaultApp
            title="mdpkm"
            theme={theme}
        {...props}/>
    );
};