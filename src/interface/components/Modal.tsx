import { keyframes } from '@stitches/react';
import { Grid, Portal } from 'voxeliface';
import React, { ReactNode } from 'react';

import Patcher from '../../plugins/patcher';
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
export type ModalProps = {
    width?: string | number,
    height?: string | number,
    children?: ReactNode | ReactNode[]
};
export default Patcher.register(function Modal({ width, height, children }: ModalProps) {
    return <Portal>
        <Grid width="100vw" height="100vh" vertical alignItems="center" background="#00000099" justifyContent="center" css={{
            top: 0,
            left: 0,
			zIndex: 10,
            position: 'absolute',
            animation: `${openAnimation2} .5s`
        }}>
            <Grid width={width} height={height} padding={12} vertical background="$secondaryBackground" borderRadius={8} css={{
                border: '1px solid $secondaryBorder2',
                position: 'relative',
                animation: `${openAnimation} .5s cubic-bezier(0, 0, 0, 1.0)`
            }}>
                {children}
            </Grid>
        </Grid>
    </Portal>;
});