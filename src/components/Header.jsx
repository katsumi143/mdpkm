import React from 'react';

import Tag from './Tag';
import Image from '/voxeliface/components/Image';
import Typography from '/voxeliface/components/Typography';
import DefaultHeader from '/voxeliface/components/Header/Tauri';
import ImageTransition from './Transition/Image';

import { AvatarType, useCurrentAccount } from '../common/voxura';
export default function Header(props) {
    const account = useCurrentAccount();
    return (
        <DefaultHeader brand={<>
            {props.image ??
                <Image
                    src="img/banners/brand_text.svg"
                    width={148}
                    height={48}
                />
            }
        </>} {...props}>
            {account && <Tag css={{
                gap: 10,
                right: '8rem',
                padding: '4px 8px',
                position: 'absolute',
                background: '$primaryBackground',
                borderColor: '$secondaryBorder'
            }}>
                <ImageTransition src={account.getAvatarUrl(AvatarType.Minecraft)} size={24} borderRadius={8} css={{
                    backgroundColor: '$primaryBackground'
                }}/>
                <Typography size=".75rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                    {account.name}
                </Typography>
            </Tag>}
        </DefaultHeader>
    );
};