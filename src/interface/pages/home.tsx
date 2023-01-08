import { useTranslation } from 'react-i18next';
import { Grid, Typography } from 'voxeliface';
import React, { useMemo, useState, useEffect, MouseEventHandler } from 'react';

import Instance from '../components/Instance';
import NewsItem from '../components/News/item';
import ImageWrapper from '../components/ImageWrapper';
import LoadingInstances from '../components/LoadingInstances';

import mdpkm from '../../mdpkm';
import voxura from '../../voxura';
import { setPage } from '../../store/slices/interface';
import { useAppDispatch } from '../../store/hooks';
import { AvatarType, AvatarStyle } from '../../../voxura';
import { useCurrentAccount, useRecentInstances } from '../../voxura';
export default function Home() {
	const { t } = useTranslation('interface');
	const recent = useRecentInstances();
	const account = useCurrentAccount();
	const dispatch = useAppDispatch();
	const greeting = useMemo(() => getGreeting(), []);
	const [news, setNews] = useState<any[] | null>(null);
	useEffect(() => {
		mdpkm.getNewsSource('minecraft')?.getNews().then(news => setNews(news.slice(0, 10)));
	}, []);

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
			<Grid width="65%" padding="12px 0 12px 1rem" vertical justifyContent="space-between">
				<Grid height="fit-content" margin="24px 0 0" spacing={24} alignItems="center">
					<ImageWrapper src={account?.getAvatarUrl(AvatarType.Minecraft, AvatarStyle.Bust, 128)} size={128} border="2px solid $secondaryBorder" pixelated canPreview borderRadius={64} css={{
						'&:before': {
							width: '100%',
							height: '100%',
							zIndex: -1,
							content: '',
							opacity: 0.5,
							background: '$primaryBackground',
							borderRadius: '50%'
						}
					}}/>
					<Grid vertical>
						<Typography size={20} noSelect>
							{t(`home.greeting.${greeting}`)}
						</Typography>
						<Typography size={18} color="$secondaryColor" noSelect>
							{account?.name}!
						</Typography>
					</Grid>
				</Grid>
				<Grid spacing={8} vertical>
					<Grid justifyContent="space-between" css={{
						borderBottom: '1px solid $secondaryBorder2',
						paddingBottom: 6
					}}>
						<Typography noSelect>{t('home.news.title')}</Typography>
						<ViewAll/>
					</Grid>
					<Grid width="100%" spacing={8} borderRadius={8} css={{ overflow: 'hidden' }}>
						{news?.map((item, key) => <NewsItem key={key} item={item}/>)}
					</Grid>
				</Grid>
			</Grid>
			<Grid width="35%" height="100%" padding="12px 1rem 12px 0" vertical>
				<Grid justifyContent="space-between" css={{
					borderBottom: '1px solid $secondaryBorder2',
					paddingBottom: 6
				}}>
					<Typography noSelect>{t('home.recent_instances.title')}</Typography>
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