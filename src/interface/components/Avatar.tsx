import { motion } from 'framer-motion';
import { CSS, styled } from '@stitches/react';
import React, { useRef, useState, useEffect } from 'react';

import ImagePreview from './ImagePreview';
import { PLACEHOLDER_IMAGE } from '../../util/constants';
const StyledAvatar = styled(motion.img, {
	width: '$$size',
	height: '$$size',
	cursor: 'zoom-in',
	objectFit: 'fill',
	userSelect: 'none',
	background: '$secondaryBackground',
	'--squircle-smooth': 1,
	'-webkit-mask-image': 'paint(squircle)',

	variants: {
		size: {
			xs: {
				$$size: '32px',
				'--squircle-radius': 8
			},
			sm: {
				$$size: '40px',
				'--squircle-radius': 8
			},
			md: {
				$$size: '48px',
				'--squircle-radius': 8
			},
			lg: {
				$$size: '64px',
				'--squircle-radius': 8
			}
		},
		blur: { true: {
			filter: 'blur(2px)'
		} },
		circle: { true: {
			borderRadius: '50%',
			'-webkit-mask-image': 'unset'
		} },
		transparent: { true: {
			background: 'none',
			'-webkit-mask-image': 'unset'
		} }
	}
});
export interface AvatarProps {
	css?: CSS
	src?: string | null
	size: 'xs' | 'sm' | 'md' | 'lg'
	blur?: boolean
	margin?: string
	circle?: boolean
	layoutId?: string
	transparent?: boolean
}
export default function Avatar({ src, size, blur, margin, circle, layoutId, transparent }: AvatarProps) {
	const img = useRef<HTMLImageElement>(null);
	const imgSrc = src || PLACEHOLDER_IMAGE;
	const [preview, setPreview] = useState(false);
	const togglePreview = () => setPreview(p => !p);
	useEffect(() => {
		const image = img.current;
		if (image && !imgSrc.includes('svg')) {
			const isPixelated = () => {
				if (image.naturalWidth !== image.clientWidth && image.naturalWidth <= 96 && image.naturalWidth > 0)
					image.style.imageRendering = 'pixelated';
			};
			if (image.naturalWidth)
				isPixelated();
			else
				image.addEventListener('load', isPixelated);
		}
	}, []);

	return <React.Fragment>
		{preview && <ImagePreview src={imgSrc} onClose={togglePreview}/>}
		<StyledAvatar src={imgSrc} ref={img} size={size} blur={blur} circle={circle} onClick={togglePreview} layoutId={layoutId} transparent={transparent} css={{
			margin
		}}/>
	</React.Fragment>;
}