import { Image, ImageProps } from 'voxeliface';
import React, { useState, MouseEventHandler } from 'react';

import ImagePreview from './ImagePreview';
import { PLACEHOLDER_IMAGE } from '../../util/constants';
export interface ImageWrapperProps extends ImageProps {
	ratio?: number
    shadow?: boolean
    canPreview?: boolean
	previewWidth?: number
}
export default function ImageWrapper({ src, ratio, shadow, canPreview, previewWidth, ...props }: ImageWrapperProps) {
    const [preview, setPreview] = useState(false);
    const toggle: MouseEventHandler<HTMLDivElement> = event => {
		event.stopPropagation();
        if (canPreview)
            setPreview(v => !v);
    };
    return <React.Fragment>
        <Image {...props} src={src ?? PLACEHOLDER_IMAGE} onClick={toggle} css={{
            cursor: canPreview && 'zoom-in',
            boxShadow: shadow && '$buttonShadow',
            ...props.css
        }}/>
        {preview && <ImagePreview src={src ?? PLACEHOLDER_IMAGE} ratio={ratio} width={previewWidth} onClose={toggle} pixelated={props.pixelated}/>}
    </React.Fragment>;
}