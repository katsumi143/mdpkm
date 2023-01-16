import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import { Link, Grid, Image, Typography } from 'voxeliface';

import ImagePreview from '../../ImagePreview';

import { useAppSelector } from '../../../../store/hooks';
export interface ResourcePackItemProps {
    item: {
		name: string,
		icon: number[],
		metadata: any
	}
}
export default function ResourcePackItem({ item }: ResourcePackItemProps) {
    const { t } = useTranslation('interface');
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const [previewIcon, setPreviewIcon] = useState(false);

	const icon = useMemo(() => item.icon ? Buffer.from(item.icon).toString('base64') : null, [item.icon]);
    const packIcon = icon ? `data:image/png;base64,${icon}` : 'img/icon/minecraft/unknown_pack.png';
    return <Grid padding={8} spacing={isCompact ? 10 : 12} alignItems="center" background="$secondaryBackground2" borderRadius={16} css={{
        border: 'transparent solid 1px',
        position: 'relative',
        background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
    }}>
        <Image
            src={packIcon}
            size={isCompact ? 38 : 40}
            onClick={() => setPreviewIcon(true)}
            background="$secondaryBackground"
            borderRadius={8}
            css={{
                cursor: 'zoom-in',
                boxShadow: '$buttonShadow'
            }}
        />
        {previewIcon && <ImagePreview src={packIcon} onClose={() => setPreviewIcon(false)} pixelated/>}
        <Grid spacing={2} vertical>
            <Typography size={isCompact ? 14 : 16} noSelect lineheight={1}>
                {item.name}
            </Typography>
            <Typography size={isCompact ? 10 : 12} color="$secondaryColor" noSelect lineheight={1}>
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