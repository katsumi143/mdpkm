import React from 'react';
import { open } from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';
import { Grid, Image, Typography } from 'voxeliface';

import type NewsItem from '../../../mdpkm/news/item';
export interface NewsItemProps {
    item: NewsItem<unknown>
}
export default function NewsItemComponent({ item }: NewsItemProps) {
	const { t } = useTranslation('interface');
	const view = () => open(item.url);
    return <Grid height={128} onClick={view} vertical smoothing={1} cornerRadius={12} justifyContent="space-between" css={{
		cursor: 'pointer',
		minWidth: 192,
		position: 'relative',
		transition: 'filter .25s',
		'&:hover': {
			filter: 'brightness(1.25)',
			'& .thumbnail': {
				opacity: 0.5,
				backgroundSize: '110%'
			}
		}
	}}>
		<Image src={item.image} width="100%" height="100%" className="thumbnail" css={{
			opacity: 0.4,
			position: 'absolute',
			transition: 'opacity 1s, background-size 1s',
			backgroundSize: '100%'
		}}/>
		<Grid padding={12} spacing={3} vertical css={{ zIndex: 1 }}>
			<Typography size={10} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1.1} css={{
				textShadow: '#00000080 0 0 1px',
				textTransform: 'uppercase'
			}}>
				{t('news.item.tag', { item })}
			</Typography>
			<Typography weight={600} noSelect lineheight={1.1} css={{
				display: 'block',
				overflow: 'hidden',
				textShadow: '#00000080 0 0 2px',
				textOverflow: 'ellipsis'
			}}>
				{item.title}
			</Typography>
		</Grid>
	</Grid>;
}