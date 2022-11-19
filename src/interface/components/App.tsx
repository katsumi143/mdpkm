import React from 'react';
import { BreakpointProvider } from 'react-socks';

import TauriApp, { TauriAppProps } from '../../../voxeliface/components/App/Tauri';

import { useAppSelector } from '../../store/hooks';
export default function App(props: TauriAppProps) {
    const theme = useAppSelector(state => state.settings.theme);
    return (
        <BreakpointProvider>
            <TauriApp
                theme={theme}
                {...props}
            />
        </BreakpointProvider>
    );
};