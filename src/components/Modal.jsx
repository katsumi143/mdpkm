import React from 'react';

import Grid from '/voxeliface/components/Grid';
import Portal from '/voxeliface/components/Portal';

import Patcher from '/src/common/plugins/patcher';
export default Patcher.register(function Modal({ width, height, children }) {
    return <Portal>
        <Grid width="100vw" height="100vh" direction="vertical" alignItems="center" background="#00000099" justifyContent="center" css={{
            top: 0,
            left: 0,
            zIndex: 100000,
            position: 'absolute'
        }}>
            <Grid width={width} height={height} padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                border: '1px solid $secondaryBorder2',
                position: 'relative'
            }}>
                {children}
            </Grid>
        </Grid>
    </Portal>;
});