import { Image, ImageProps } from 'voxeliface';
import React, { MouseEventHandler } from 'react';

import { useAppDispatch } from '../../store/hooks';
import { setImagePreview } from '../../store/slices/interface';
import { PLACEHOLDER_IMAGE } from '../../util/constants';
export interface ImageWrapperProps extends ImageProps {
	ratio?: number
    shadow?: boolean
    canPreview?: boolean
	previewWidth?: number
}
export default function ImageWrapper({ src, ratio, shadow, canPreview, previewWidth, ...props }: ImageWrapperProps) {
    const dispatch = useAppDispatch();
	const preview: MouseEventHandler<HTMLDivElement> = event => {
		event.stopPropagation();
        if (canPreview)
            dispatch(setImagePreview({
				src: src || PLACEHOLDER_IMAGE,
				ratio,
				width: previewWidth
			}));
    };
    return <React.Fragment>
        <Image {...props} src={src || PLACEHOLDER_IMAGE} onClick={preview} css={{
            cursor: canPreview && 'zoom-in',
            boxShadow: shadow && '$buttonShadow',
            ...props.css
        }}/>
    </React.Fragment>;
}