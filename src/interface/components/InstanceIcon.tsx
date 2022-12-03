import React, { useState } from 'react';

import { Image } from '../../../voxeliface';
import ImagePreview from './ImagePreview';
import type { ImageProps } from '../../../voxeliface/components/Image';

import Patcher from '../../plugins/patcher';
import type { Instance } from '../../../voxura';
export type InstanceIconProps = ImageProps & {
    size?: number,
    instance: Instance,
    borderRadius?: number
};
export default Patcher.register(function InstanceIcon({ size = 48, instance, borderRadius = 8, ...props }: InstanceIconProps) {
    const [preview, setPreview] = useState(false);
    return <React.Fragment>
        <Image src={instance.webIcon} onClick={() => setPreview(true)} background="$secondaryBackground" borderRadius={borderRadius} {...props} css={{
            width: 'fit-content',
            cursor: 'zoom-in',
            height: 'fit-content',
            display: 'block',
            minWidth: size,
            minHeight: size,
            boxShadow: '$buttonShadow',
            
            ...props?.css
        }}/>
        {preview && <ImagePreview src={instance.webIcon} size={192} onClose={() => setPreview(false)}/>}
    </React.Fragment>;
});