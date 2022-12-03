import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, MouseEventHandler } from 'react';

import Instance from '../components/Instance';
import NewsItem from '../components/News/item';
import ImageWrapper from '../components/ImageWrapper';
import { Grid, Typography } from '../../../voxeliface/src';

import mdpkm from '../../mdpkm';
import { setPage } from '../../store/slices/interface';
import { useAppDispatch } from '../../store/hooks';
import { AvatarType, AvatarStyle } from '../../../voxura';
import { useCurrentAccount, useRecentInstances } from '../../voxura';
export default function Home() {
	const { t } = useTranslation();
	const recent = useRecentInstances();
	const account = useCurrentAccount();
	const dispatch = useAppDispatch();
	const [news, setNews] = useState<any[] | null>(null);
	useEffect(() => {
		mdpkm.getNewsSource('minecraft')?.getNews().then(setNews);
	}, []);

	return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical css={{ overflow: 'hidden' }}>
		<Grid height="100%" spacing={16} justifyContent="space-between" css={{ overflow: 'hidden' }}>
			<Grid width="65%" vertical justifyContent="space-between">
				<Grid height="fit-content" margin="24px 0 0" spacing={24} alignItems="center">
					<ImageWrapper src={account?.getAvatarUrl(AvatarType.Minecraft, AvatarStyle.Bust, 128)} size={128} border="2px solid $secondaryBorder" pixelated canPreview borderRadius={64} />
					<Grid vertical>
						<Typography size={20}>
							{t(`interface:home.greeting.${getGreeting()}`)}
						</Typography>
						<Typography size={18} color="$secondaryColor">{account?.name}!</Typography>
					</Grid>
				</Grid>
				<Grid spacing={8} vertical>
					<Grid justifyContent="space-between" css={{
						borderBottom: '1px solid $secondaryBorder2',
						paddingBottom: 6
					}}>
						<Typography>{t('interface:home.news.title')}</Typography>
						<ViewAll/>
					</Grid>
					<Grid width="100%" spacing={8} borderRadius={8} css={{ overflowX: 'auto' }}>
						{news?.map((item, key) => <NewsItem key={key} item={item} />)}
					</Grid>
				</Grid>
			</Grid>
			<Grid width="35%" height="100%" spacing={16} vertical>
				<Grid justifyContent="space-between" css={{
					borderBottom: '1px solid $secondaryBorder2',
					paddingBottom: 6
				}}>
					<Typography>{t('interface:home.recent_instances.title')}</Typography>
					<ViewAll onClick={() => dispatch(setPage('instances'))}/>
				</Grid>
				<Grid height="100%" spacing={8} vertical css={{ overflowY: 'auto' }}>
					{recent.map((instance, key) =>
						<Instance key={key} instance={instance} css={{ padding: 0 }} />
					)}
				</Grid>
			</Grid>
		</Grid>
	</Grid>;
};

function getGreeting() {
	const date = new Date();
	const hours = date.getHours();
	if (hours < 12)
		return 0;
	else if (hours <= 17)
		return 1;
	return 2;
};

export type ViewAllProps = {
	onClick?: MouseEventHandler<HTMLSpanElement>
};
function ViewAll({ onClick }: ViewAllProps) {
	const { t } = useTranslation();
	return <Typography size={12} color="$linkColor" onClick={onClick} spacing={8} horizontal css={{
		cursor: 'pointer',
		'&:hover': {
			color: '$primaryColor'
		}
	}}>
		{t('interface:common.action.view_all')}
		<IconBiArrowRight/>
	</Typography>
};