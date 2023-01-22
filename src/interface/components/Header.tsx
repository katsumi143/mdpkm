import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Image, Typography } from 'voxeliface';
import { TauriHeader, TauriHeaderProps } from 'voxeliface-tauri';

import { i } from '../../util';
import Avatar from './Avatar';
import { setPage } from '../../store/slices/interface';
import { APP_VERSION } from '../../util/constants';
import { useAppDispatch } from '../../store/hooks';
import { useMinecraftAccount } from '../../voxura';

export type HeaderProps = TauriHeaderProps;
export default function DefaultHeader(props: HeaderProps) {
	const { t } = useTranslation('interface');
    const account = useMinecraftAccount();
    const dispatch = useAppDispatch();
    const viewAccounts = () => dispatch(setPage('accounts'));
    return <TauriHeader brand={<Image src={i('header')} width={148} height={48}/>} clickable={false} {...props}>
		{APP_VERSION.includes('beta') && <Typography size={14} color="$secondaryColor" margin="2px 0 0" css={{
			left: 172,
			position: 'absolute',
		}}>
			BETA
		</Typography>}
		{account && <Grid spacing={12} onClick={viewAccounts} borderRadius={8} css={{
			right: 144,
			cursor: 'pointer',
			position: 'absolute'
		}}>
			<Avatar src={account.getAvatarUrl()} size="xs" transparent/>
			<Grid spacing={2} vertical justifyContent="center">
				<Typography size={12} color="$secondaryColor" lineheight={1}>
					{t('header.account')}
				</Typography>
				<Typography size={14} color="$linkColor" weight={400} family="$secondary" lineheight={1}>
					{account.primaryName}
				</Typography>
			</Grid>
		</Grid>}
	</TauriHeader>;
};