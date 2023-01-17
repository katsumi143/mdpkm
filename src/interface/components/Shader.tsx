import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import { Link, Grid, Typography } from 'voxeliface';

import Avatar from './Avatar';
export interface ShaderItem {
	name?: string
	icon?: number[]
	source?: string
	version: string
}
export interface ShaderProps {
    item: ShaderItem
}
export default function Shader({ item }: ShaderProps) {
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
            <Typography noSelect lineheight={1}>
                {item.name}
            </Typography>
            <Typography size={12} color="$secondaryColor" noSelect lineheight={1}>
                {t('common.label.version', [item.version])}
            </Typography>
        </Grid>
        <Grid height="100%" margin="0 0 0 auto" spacing={8} alignItems="center">
			<Grid vertical alignItems="end">
				{item.source && <Typography size={12} color="$secondaryColor" spacing={6} noSelect>
					<IconBiCloudFill/>
					{t(`voxura:platform.${item.source}`)}
				</Typography>}
			</Grid>
            <Link size={12} padding="0 16px" disabled>
                <IconBiTrash3Fill/>
                {t('common.action.delete')}
            </Link>
        </Grid>
    </Grid>;
}