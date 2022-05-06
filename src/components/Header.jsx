import React from 'react';
import { useSelector } from 'react-redux';

import Tag from './Tag';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Typography from '/voxeliface/components/Typography';
import DefaultHeader from '/voxeliface/components/Header/Tauri';

import { SKIN_API_BASE } from '../common/constants';
export default function Header(props) {
    const uuid = useSelector(state => state.accounts.selected);
    const { profile } = useSelector(state => state.accounts.data).find(a => a.profile.uuid === uuid) ?? {};
    return (
        <DefaultHeader brand={<>
            {props.image ??
                <Image
                    src="img/banners/brand_text.svg"
                    width={104}
                    height={44}
                />
            }
        </>} {...props}>
            {profile && <Tag css={{
                gap: 10,
                right: '8rem',
                padding: '4px 8px',
                position: 'absolute',
                background: '$secondaryBackground2',
                borderColor: '$secondaryBorder2'
            }}>
                <Grid spacing={2} direction="vertical">
                    <Typography size=".7rem" color="$primaryColor" family="Nunito" lineheight={1}>
                        Your Account
                    </Typography>
                    <Typography size=".6rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        {profile.name}
                    </Typography>
                </Grid>
                <Image src={`${SKIN_API_BASE}/face/${uuid}`} size={24} borderRadius={4} css={{
                    backgroundColor: '$primaryBackground'
                }}/>
            </Tag>}
        </DefaultHeader>
    );
};