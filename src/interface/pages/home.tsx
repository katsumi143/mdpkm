import { useTranslation } from 'react-i18next';
import { Grid, Typography } from 'voxeliface';
import React, { useMemo, useState, useEffect, MouseEventHandler } from 'react';

import Avatar from '../components/Avatar';
import Instance from '../components/Instance';
import HomePost from '../components/HomePost';
import NewsListItem from '../components/News/item';
import LoadingInstances from '../components/LoadingInstances';

import mdpkm from '../../mdpkm';
import NewsItem from '../../mdpkm/news/item';
import { setPage } from '../../store/slices/interface';
import { MinecraftAvatarStyle } from '../../../voxura';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import voxura, { useMinecraftAccount, useRecentInstances } from '../../voxura';
export default function Home() {
	const { t } = useTranslation('interface');
	const recent = useRecentInstances();
	const account = useMinecraftAccount();
	const dispatch = useAppDispatch();
	const greeting = useMemo(() => getGreeting(), []);
	const showNews = useAppSelector(state => state.settings.showNews);
	const [news, setNews] = useState<any[] | null>(null);
	const [mdpkmPost, setMdpkmPost] = useState<NewsItem<any> | null>(null);
	useEffect(() => {
		mdpkm.getNewsSource('mdpkm')?.getNews().then(news => setMdpkmPost(news[0]));
	}, []);
	useEffect(() => {
		if (showNews)
			mdpkm.getNewsSource('minecraft')?.getNews().then(news => setNews(news.slice(0, 5)));
	}, [showNews]);

	const loadingInstances = voxura.instances.loading;
	return <Grid width="100%" height="inherit" vertical css={{ overflow: 'hidden' }}>
		<Grid height="100%" spacing={16} justifyContent="space-between" css={{ overflow: 'hidden' }}>
			<Grid width="100%" height="60%" background={`url(img/banner/instance/banner1_${greeting + 1}.webp)`} css={{
				zIndex: -1,
				opacity: 0.5,
				position: 'absolute',
				backgroundSize: 'cover',
				backgroundPosition: 'center'
			}}>
				<Grid width="100%" height="100%" background="linear-gradient(transparent, $primaryBackground)"/>
			</Grid>
			<Grid width="65%" padding="12px 0 12px 1rem" vertical>
				<Grid height="fit-content" margin="24px 0 0" spacing={24} alignItems="center">
					<Avatar src={account?.getAvatarUrl(MinecraftAvatarStyle.Bust, 128)} size="xl" circle transparent css={{
						backdropFilter: 'brightness(1.25)'
					}}/>
					<Grid vertical spacing={4}>
						<Typography size={24} family="$tertiary" weight={600} noSelect lineheight={1}>
							{t(`home.greeting.${greeting}`)}
						</Typography>
						<Typography size={20} color="$secondaryColor" family="$secondary" noSelect lineheight={1}>
							{account?.primaryName}!
						</Typography>
					</Grid>
				</Grid>
				{mdpkmPost && <HomePost item={mdpkmPost}/>}
				{showNews && news && <>
					<Grid margin="auto 0 0" padding={8} justifyContent="space-between">
						<Typography family="$tertiary" noSelect>{t('home.news.title')}</Typography>
						<ViewAll/>
					</Grid>
					<Grid width="100%" spacing={8} smoothing={1} borderRadius={16} css={{ overflow: 'hidden' }}>
						{news?.map((item, key) => <NewsListItem key={key} item={item}/>)}
					</Grid>
				</>}
			</Grid>
			<Grid width="35%" height="100%" padding="12px 1rem 12px 0" vertical>
				<Grid padding="0 8px" justifyContent="space-between">
					<Typography family="$tertiary" noSelect>{t('home.recent_instances.title')}</Typography>
					<ViewAll onClick={() => dispatch(setPage('instances'))}/>
				</Grid>
				<Grid height="100%" spacing={8} padding="16px 0 0" vertical css={{ overflowY: 'auto' }}>
					{loadingInstances ? <LoadingInstances/> : recent.map(instance =>
						<Instance id={instance.id} key={instance.id}/>
					)}
				</Grid>
			</Grid>
		</Grid>
	</Grid>;
}

function getGreeting() {
	const date = new Date();
	const hours = date.getHours();
	if (hours < 12)
		return 0;
	else if (hours <= 17)
		return 1;
	return 2;
}

// TODO: move into a separate file
export interface ViewAllProps {
	onClick?: MouseEventHandler<HTMLSpanElement>
}
export function ViewAll({ onClick }: ViewAllProps) {
	const { t } = useTranslation('interface');
	return <Typography size={12} color="$linkColor" onClick={onClick} noSelect css={{
		cursor: 'pointer',
		'&:hover': { color: '$primaryColor' }
	}}>
		{t('common.action.view_all')}
		<IconBiArrowRight/>
	</Typography>
}