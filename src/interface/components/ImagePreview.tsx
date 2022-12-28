import { keyframes } from '@stitches/react';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import React, { MouseEventHandler } from 'react';
import { Grid, Image, Portal, Typography } from 'voxeliface';

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
export interface ImagePreviewProps {
    src?: string
	ratio?: number
	width?: number
    onClose?: MouseEventHandler<HTMLDivElement>
    pixelated?: boolean
}
export default function ImagePreview({ src, ratio = 1, width = 256, onClose, pixelated }: ImagePreviewProps) {
    return <Portal>
        <Grid width="100vw" height="100vh" spacing={8} onClick={onClose} vertical alignItems="center" background="#000000bf" justifyContent="center" css={{
            top: 0,
            left: 0,
            zIndex: 100000,
            cursor: 'default',
            position: 'absolute',
            animation: `${openAnimation2} 1s`
        }}>
			<Grid width={width}>
				<AspectRatio.Root ratio={ratio}>
					<Image src={src} width="100%" height="100%" smoothing={1} borderRadius={16} css={{
						animation: `${openAnimation} .5s cubic-bezier(0, 0, 0, 1.0)`,
						imageRendering: pixelated && 'pixelated'
					}}/>
				</AspectRatio.Root>
			</Grid>
            <Typography size={14} color="$secondaryColor" family="$secondary" css={{
                animation: `${openAnimation3} .75s`
            }}>
                Click anywhere to close
            </Typography>
        </Grid>
    </Portal>;
}