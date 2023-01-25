import React from 'react';
import { open } from '@tauri-apps/api/shell';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { useTranslation } from 'react-i18next';
import { Grid, Image, Typography } from 'voxeliface';

import type NewsItem from '../../mdpkm/news/item';
import { useAppSelector } from '../../store/hooks';
export interface HomePostProps {
	item: NewsItem<any>
}
export default function HomePost({ item }: HomePostProps) {
	const { t } = useTranslation('interface');
	const showNews = useAppSelector(state => state.settings.showNews);
	return <Grid width="100%" margin={showNews ? '32px 0 0' : 'auto 0 24px'}>
		<AspectRatio ratio={8 / 2}>
			<Grid width="100%" height="100%" onClick={() => open(item.url)} smoothing={1} borderRadius={16} css={{
				cursor: 'pointer',
				position: 'relative',
				transition: 'filter .25s',
				'&:hover': {
					filter: 'brightness(1.25)',
					'& .thumbnail': {
						opacity: 0.6,
						backgroundSize: '110%'
					}
				}
			}}>
				<Image src={item.image} width="100%" height="100%" className="thumbnail" css={{
					zIndex: -1,
					opacity: 0.5,
					position: 'absolute',
					transition: 'opacity 1s, background-size 1s',
					backgroundSize: '100%'
				}}/>
				<Grid padding={16} vertical>
					<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1} css={{
						textTransform: 'uppercase'
					}}>
						{t('news.item.tag', { item })}
					</Typography>
					<Typography size={28} weight={700} family="$tertiary" noSelect css={{
						textShadow: '#00000040 0 2px 4px'
					}}>
						{item.title}
					</Typography>
					<Typography size={16} family="$tertiary" weight={500} noSelect lineheight={0.5} css={{
						textShadow: '#00000040 0 1px 2px'
					}}>
						{t('common.label.author', [item.authors])}
					</Typography>
				</Grid>
			</Grid>
		</AspectRatio>
	</Grid>;
}