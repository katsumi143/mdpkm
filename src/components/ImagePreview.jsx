import React from 'react';
import { keyframes } from '@stitches/react';

import Grid from '../../voxeliface/components/Grid';
import Image from '../../voxeliface/components/Image';
import Portal from '../../voxeliface/components/Portal';
import Typography from '../../voxeliface/components/Typography';

const openAnimation = keyframes({
    '0%': {
        opacity: 0,
        transform: 'scale(0.75) translateY(50%)'
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
        background: '#000000bf'
    }
});
const openAnimation3 = keyframes({
    '0%': {
        opacity: 0
    },
    '50%': {
        opacity: 0
    },
    '100%': {
        opacity: 1
    }
});
export default function ImagePreview({ src, size, onClose }) {
    return <Portal>
        <Grid width="100vw" height="100vh" spacing={8} onClick={onClose} direction="vertical" alignItems="center" background="#000000bf" justifyContent="center" css={{
            top: 0,
            left: 0,
            zIndex: 100000,
            cursor: 'default',
            position: 'absolute',
            animation: `${openAnimation2} 1s`
        }}>
            <Image src={src} size={size} borderRadius={8} css={{
                animation: `${openAnimation} .5s cubic-bezier(0, 0, 0, 1.0)`
            }}/>
            <Typography size=".8rem" color="$secondaryColor" css={{
                animation: `${openAnimation3} .75s`
            }}>
                Click anywhere to close
            </Typography>
        </Grid>
    </Portal>;
};