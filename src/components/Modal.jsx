import React from 'react';
import { keyframes } from '@stitches/react';

import Grid from '/voxeliface/components/Grid';
import Portal from '/voxeliface/components/Portal';

import Patcher from '/src/common/plugins/patcher';
const openAnimation = keyframes({
    '0%': {
        opacity: 0,
        transform: 'scale(1.05)'
    },
    '100%': {
        opacity: 1,
        transform: 'none'
    }
});
const openAnimation2 = keyframes({
    '0%': {
        background: 'transparent'
    },
    '100%': {
        background: '#00000099'
    }
});
export default Patcher.register(function Modal({ width, height, children }) {
    return <Portal>
        <Grid width="100vw" height="100vh" direction="vertical" alignItems="center" background="#00000099" justifyContent="center" css={{
            top: 0,
            left: 0,
            zIndex: 100000,
            position: 'absolute',
            animation: `${openAnimation2} .5s`
        }}>
            <Grid width={width} height={height} padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                border: '1px solid $secondaryBorder2',
                position: 'relative',
                animation: `${openAnimation} .5s cubic-bezier(0, 0, 0, 1.0)`
            }}>
                {children}
            </Grid>
        </Grid>
    </Portal>;
});