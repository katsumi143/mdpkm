import { Image, ImageProps } from 'voxeliface';
import React, { useState, MouseEventHandler } from 'react';

import ImagePreview from './ImagePreview';
export interface ImageWrapperProps extends ImageProps {
	ratio?: number
    shadow?: boolean
    canPreview?: boolean
	previewWidth?: number
}
export default function ImageWrapper({ ratio, shadow, canPreview, previewWidth, ...props }: ImageWrapperProps) {
    const [preview, setPreview] = useState(false);
    const toggle: MouseEventHandler<HTMLDivElement> = event => {
		event.stopPropagation();
        if (canPreview)
            setPreview(v => !v);
    };
    return <React.Fragment>
        <Image {...props} onClick={toggle} css={{
            cursor: canPreview && 'zoom-in',
            boxShadow: shadow && '$buttonShadow',
            ...props.css
        }}/>
        {preview && <ImagePreview src={props.src} ratio={ratio} width={previewWidth} onClose={toggle} pixelated={props.pixelated}/>}
    </React.Fragment>;
}