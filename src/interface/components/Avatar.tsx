import { motion } from 'framer-motion';
import { getSvgPath } from 'figma-squircle';
import { CSS, styled } from '@stitches/react';
import React, { useRef, useMemo, useEffect, MouseEventHandler } from 'react';

import { useAppDispatch } from '../../store/hooks';
import { setImagePreview } from '../../store/slices/interface';
import { PLACEHOLDER_IMAGE } from '../../util/constants';
const SIZE_MAP = { xs: 32, sm: 40, md: 48, lg: 64, xl: 128 };
const StyledAvatar = styled(motion.img, {
	width: '$$size',
	height: '$$size',
	cursor: 'zoom-in',
	objectFit: 'cover',
	userSelect: 'none',
	background: '$secondaryBackground',
	imageRendering: '-webkit-optimize-contrast',

	variants: {
		size: {
			xs: { $$size: '32px' },
			sm: { $$size: '40px' },
			md: { $$size: '48px' },
			lg: { $$size: '64px' },
			xl: { $$size: '128px' }
		},
		blur: { true: {
			filter: 'blur(2px)'
		} },
		circle: { true: {
			borderRadius: '50%'
		} },
		transparent: { true: {
			background: 'none'
		} }
	}
});
export interface AvatarProps {
	css?: CSS
	src?: string | null
	size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	blur?: boolean
	margin?: string
	circle?: boolean
	layoutId?: string
	transparent?: boolean
}

const CLIP_PATHES = Object.fromEntries(Object.entries(SIZE_MAP).map(([key, size]) =>
	[key, `path('${getSvgPath({ width: size, height: size, cornerRadius: 8, cornerSmoothing: 1 })}')`]
));
export default function Avatar({ css, src, size, blur, margin, circle, layoutId, transparent }: AvatarProps) {
	const img = useRef<HTMLImageElement>(null);
	const imgSrc = src || PLACEHOLDER_IMAGE;
	const dispatch = useAppDispatch();
	const clipPath = useMemo(() => circle ? undefined : CLIP_PATHES[size], [size, circle]);
	const preview: MouseEventHandler<HTMLDivElement> = event => {
		event.stopPropagation();
		dispatch(setImagePreview({
			src: imgSrc
		}));
	};
	useEffect(() => {
		const image = img.current;
		if (image && !imgSrc.includes('svg')) {
			const isPixelated = () => {
				if (image.naturalWidth < image.clientWidth)
					image.style.imageRendering = 'pixelated';
			};
			if (image.naturalWidth)
				isPixelated();
			else
				image.addEventListener('load', isPixelated);
		}
	}, []);

	return <StyledAvatar src={imgSrc} ref={img} size={size} blur={blur} circle={circle} onClick={preview} layoutId={layoutId} transparent={transparent} css={{
		margin,
		clipPath,
		...css
	}}/>;
}