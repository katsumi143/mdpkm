import React from 'react';
import { Grid, Image, Typography } from 'voxeliface';
import { TauriHeader, TauriHeaderProps } from 'voxeliface-tauri';

import { setPage } from '../../store/slices/interface';
import { useAppDispatch } from '../../store/hooks';
import { AvatarType, useCurrentAccount } from '../../voxura';

export type HeaderProps = TauriHeaderProps;
export default function DefaultHeader(props: HeaderProps) {
    const account = useCurrentAccount();
    const dispatch = useAppDispatch();
    const viewAccounts = () => dispatch(setPage('accounts'));
    return <TauriHeader brand={<Image src="img/banners/brand_text.svg" width={148} height={48}/>} clickable={false} {...props}>
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