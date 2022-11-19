import React from 'react';

import { TauriHeaderProps } from '../../../voxeliface/components/Header/Tauri';
import { Grid, Image, Typography, TauriHeader } from '../../../voxeliface';

import { setPage } from '../../store/slices/interface';
import { useAppDispatch } from '../../store/hooks';
import { AvatarType, useCurrentAccount } from '../../voxura';
export type HeaderProps = TauriHeaderProps;
export default function Header(props: TauriHeaderProps) {
    const account = useCurrentAccount();
    const dispatch = useAppDispatch();
    const viewAccounts = () => dispatch(setPage('accounts'));
    return (
        <TauriHeader brand={<Image src="img/banners/brand_text.svg" width={148} height={48}/>} {...props}>
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
                    <Typography size={14} color="$linkColor" lineheight={1}>
                        {account.name}
                    </Typography>
                </Grid>
            </Grid>}
        </TauriHeader>
    );
};