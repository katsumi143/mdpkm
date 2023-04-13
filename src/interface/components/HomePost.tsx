import React, { useState } from 'react';
import { open } from '@tauri-apps/api/shell';
import { motion } from 'framer-motion';
import { styled } from '@stitches/react';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { Grid, Markdown } from 'voxeliface';
import { useTranslation } from 'react-i18next';

import type NewsItem from '../../mdpkm/news/item';
import { useAppSelector } from '../../store/hooks';
export interface HomePostProps {
	item: NewsItem<any>
}
export default function HomePost({ item }: HomePostProps) {
	const { t } = useTranslation('interface');
	const showNews = useAppSelector(state => state.settings.showNews);
	const [expanded, setExpanded] = useState(false);

	const view = () => open(item.url);
	const expand = () => setExpanded(v => !v);
	return <Grid width="100%" margin={showNews ? '32px 0 0' : 'auto 0 24px'}>
		<AspectRatio ratio={8 / 2}>
			<StyledRoot layout onClick={item.rawBody ? expand : view} expanded={expanded}>
				<StyledImage layout="position" css={{
					background: `url(${item.image}) center/100%`
				}}/>
				<StyledTag layout="position">
					{t('news.item.tag', { item })}
				</StyledTag>
				<StyledTitle layout="position">
					{item.title}
				</StyledTitle>
				<StyledAuthor layout="position">
					{t('common.label.author', [item.authors])}
				</StyledAuthor>
			</StyledRoot>
			<StyledContent layout expanded={expanded}>
				<Markdown text={item.rawBody?.split('\n---\n')[1]!}/>
			</StyledContent>
			<StyledCover onClick={expand} visible={expanded}/>
		</AspectRatio>
	</Grid>;
}

const StyledRoot = styled(motion.div, {
	width: '100%',
	height: 196,
	cursor: 'pointer',
	overflow: 'hidden',
	transition: 'filter .25s',
	'--squircle-smooth': 1,
	'--squircle-radius': 16,
	'-webkit-mask-image': 'paint(squircle)',

	variants: {
		expanded: {
			true: {
				top: 0,
				left: 0,
				right: 0,
				width: '60%',
				bottom: 0,
				margin: 'auto auto 30%',
				zIndex: 100,
				position: 'fixed',
				overflowY: 'auto',
				background: '$secondaryBackground2',
				borderRadius: '16px 16px 0 0',
				pointerEvents: 'none',
				'-webkit-mask-image': 'unset'
			},
			false: {
				'&:hover': {
					filter: 'brightness(1.25)'
				}
			}
		}
	}
});
const StyledImage = styled(motion.div, {
	width: '100%',
	height: 196,
	zIndex: -2,
	opacity: 0.5,
	position: 'absolute',
	transition: 'opacity 1s, background-size 1s',
	'&:hover': {
		opacity: 0.6,
		backgroundSize: '110%'
	}
});
const StyledTag = styled(motion.p, {
	color: '$secondaryColor',
	margin: '16px 0 0 16px',
	fontSize: 12,
	lineHeight: 1,
	fontWeight: 400,
	userSelect: 'none',
	fontFamily: '$secondary',
	pointerEvents: 'none',
	textTransform: 'uppercase'
});
const StyledTitle = styled(motion.p, {
	margin: '4px 16px 2px',
	fontSize: 28,
	lineHeight: 1,
	fontWeight: 700,
	userSelect: 'none',
	fontFamily: '$tertiary',
	textShadow: '#00000040 0 2px 4px',
	pointerEvents: 'none'
});
const StyledAuthor = styled(motion.p, {
	margin: '0 16px',
	fontSize: 16,
	lineHeight: 1,
	fontWeight: 500,
	userSelect: 'none',
	fontFamily: '$tertiary',
	textShadow: '#00000040 0 1px 2px',
	pointerEvents: 'none'
});
const StyledContent = styled(motion.div, {
	height: '60%',
	overflow: 'hidden auto',
	maxHeight: 0,
	background: '$secondaryBackground2',

	variants: {
		expanded: {
			true: {
				top: 0,
				left: 0,
				right: 0,
				width: '60%',
				bottom: 0,
				zIndex: 100,
				margin: 'auto auto 0',
				padding: 16,
				position: 'fixed',
				maxHeight: '100%'
			}
		}
	}
});
const StyledCover = styled('div', {
	top: 0,
	left: 0,
	width: '100%',
	zIndex: 99,
	height: '100%',
	position: 'fixed',
	background: '#00000040',
	
	variants: {
		visible: {
			false: {
				background: 'unset',
				pointerEvents: 'none'
			}
		}
	}
});