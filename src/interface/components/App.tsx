import React from 'react';
import { App, AppProps } from 'voxeliface';
import { BreakpointProvider } from 'react-socks';

import { useAppSelector } from '../../store/hooks';
export default function DefaultApp(props: AppProps) {
    const theme = useAppSelector(state => state.settings.theme);
    return <BreakpointProvider>
		<App
			css={{ borderRadius: 8 }}
			theme={theme}
			{...props}
		/>
	</BreakpointProvider>;
};