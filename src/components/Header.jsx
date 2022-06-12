import React from 'react';
import { useSelector } from 'react-redux';

import Tag from './Tag';
import Image from '/voxeliface/components/Image';
import Typography from '/voxeliface/components/Typography';
import DefaultHeader from '/voxeliface/components/Header/Tauri';
import ImageTransition from './Transition/Image';

import { SKIN_API_BASE } from '../common/constants';
export default function Header(props) {
    const uuid = useSelector(state => state.accounts.selected);
    const { profile } = useSelector(state => state.accounts.data).find(a => a.profile.id === uuid) ?? {};
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
            {profile && <Tag css={{
                gap: 10,
                right: '8rem',
                padding: '4px 8px',
                position: 'absolute',
                background: '$primaryBackground',
                borderColor: '$secondaryBorder'
            }}>
                <ImageTransition src={`${SKIN_API_BASE}/face/24/${uuid}`} size={24} borderRadius={8} css={{
                    backgroundColor: '$primaryBackground'
                }}/>
                <Typography size=".75rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                    {profile.name}
                </Typography>
            </Tag>}
        </DefaultHeader>
    );
};