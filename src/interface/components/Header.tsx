import React from 'react';
import { Grid, Image, Typography } from 'voxeliface';
import { TauriHeader, TauriHeaderProps } from 'voxeliface-tauri';

import { i } from '../../util';
import { setPage } from '../../store/slices/interface';
import { AvatarType } from '../../../voxura';
import { APP_VERSION } from '../../util/constants';
import { useAppDispatch } from '../../store/hooks';
import { useCurrentAccount } from '../../voxura';

export type HeaderProps = TauriHeaderProps;
export default function DefaultHeader(props: HeaderProps) {
    const account = useCurrentAccount();
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
			<Image src={account.getAvatarUrl(AvatarType.Minecraft)} size={32}/>
			<Grid spacing={2} vertical justifyContent="center">
				<Typography size={12} color="$secondaryColor" lineheight={1}>
					Logged-in as:
				</Typography>
				<Typography size={14} color="$linkColor" weight={400} family="$secondary" lineheight={1}>
					{account.name}
				</Typography>
			</Grid>
		</Grid>}
	</TauriHeader>;
};