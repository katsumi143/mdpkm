import React, { useState } from 'react';

import { Image } from '../../../voxeliface';
import ImagePreview from './ImagePreview';
import { ImageProps } from '../../../voxeliface/components/Image';
export type ImageWrapperProps = ImageProps & {
    shadow?: boolean,
    canPreview?: boolean
};
export default function ImageWrapper({ shadow, canPreview, ...props }: ImageWrapperProps) {
    const [preview, setPreview] = useState(false);
    const toggle = () => {
        if (canPreview)
            setPreview(v => !v);
    };
    return <React.Fragment>
        <Image {...props} onClick={toggle} css={{
            cursor: canPreview && 'zoom-in',
            boxShadow: shadow && '$buttonShadow',
            ...props.css
        }}/>
        {preview && <ImagePreview {...props} src={props.src} size={256} onClose={toggle}/>}
    </React.Fragment>;
};