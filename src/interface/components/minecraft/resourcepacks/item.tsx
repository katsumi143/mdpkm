import { Buffer } from 'buffer';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Grid, Typography } from 'voxeliface';

import Avatar from '../../Avatar';
export interface ResourcePackItemProps {
    item: {
		name: string,
		icon: number[],
		metadata: any
	}
}
export default function ResourcePackItem({ item }: ResourcePackItemProps) {
    const { t } = useTranslation('interface');

	const icon = useMemo(() => item.icon ? Buffer.from(item.icon).toString('base64') : null, [item.icon]);
    const packIcon = icon ? `data:image/png;base64,${icon}` : 'img/icon/minecraft/unknown_pack.png';
    return <Grid padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={16} css={{
        border: 'transparent solid 1px',
        position: 'relative',
        background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
    }}>
		<Avatar src={packIcon} size="sm"/>
        <Grid spacing={2} vertical>
            <Typography size={15} weight={450} noSelect lineheight={1}>
                {item.name}
            </Typography>
            <Typography size={12} color="$secondaryColor" family="$secondary" noSelect lineheight={1}>
                {item.metadata.pack?.description}
            </Typography>
        </Grid>
        <Grid height="100%" spacing={8} css={{
            right: 0,
            position: 'absolute'
        }}>
            <Link size={12} padding="0 16px">
                <IconBiTrash3Fill/>
                {t('common.action.delete')}
            </Link>
        </Grid>
    </Grid>;
}