import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, Grid, Image, Button, Typography } from 'voxeliface';

import ImagePreview from './ImagePreview';

import { useAppSelector } from '../../store/hooks';
export type ServerProps = {
	name: string,
	icon?: string,
	motd?: string,
	type?: string,
	players?: any,
	address?: string,
	instanceId?: string,
	acceptTextures?: number
};
export default function Server({ name, icon, motd, type, players, address, instanceId, acceptTextures }: ServerProps) {
    const { t } = useTranslation('interface');
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const [previewIcon, setPreviewIcon] = useState(false);
    
    const iconSize = isCompact ? 32 : 48;
    const serverIcon = icon ? icon.startsWith('data:') ? icon : `data:image/png;base64,${icon}` : 'img/icons/minecraft/unknown_server.png';
    return <Grid height="fit-content" spacing={12} smoothing={1} borderRadius={16} css={{
		border: 'transparent solid 1px',
		minWidth: '24rem',
		position: 'relative',
		background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
    }}>
        <Grid spacing={isCompact ? 10 : 12}>
            <Image
                src={serverIcon}
                size={iconSize}
				margin="8px 0 8px 8px"
                onClick={() => setPreviewIcon(true)}
				smoothing={1}
				borderRadius={8}
                css={{
                    cursor: 'zoom-in'
                }}
            />
            {previewIcon && <ImagePreview src={serverIcon} size={192} onClose={() => setPreviewIcon(false)} pixelated/>}
            <Grid height="100%" spacing={2} vertical justifyContent="center">
                <Typography size={isCompact ? 14 : 16} noSelect lineheight={1} whitespace="nowrap">
                    {name || t('server.no_name')}
                    {acceptTextures &&
                        <Typography size={isCompact ? 10 : 12} color="$secondaryColor" weight={400} family="$secondary" margin="2px 0 0" noSelect lineheight={1}>
                            {t('server.textures_accepted')}
                        </Typography>
                    }
                </Typography>
                {motd ?
                    <span dangerouslySetInnerHTML={{ __html: motd }} style={{
                        fontSize: 14,
                        textAlign: 'center',
                        fontFamily: 'Nunito'
                    }}/>
                :
                    <Typography size={isCompact ? 10 : 12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
                        {address || t('server.no_address')}
                    </Typography>
                }
            </Grid>
        </Grid>
		<Grid height="100%" spacing={8} alignItems="center" css={{
			right: 0,
			position: 'absolute'
		}}>
			<Grid height="100%" spacing={4} padding={4} vertical alignItems="end">
                {players && <Typography size={14} color="$secondaryColor" spacing={4} noSelect lineheight={1}>
                    {t('server.players', [players.online, players.max])}
                </Typography>}
                {type && <Typography size={14} color="$secondaryColor" spacing={4} noSelect lineheight={1}>
                    {type}
                </Typography>}
            </Grid>
			<Link size={isCompact ? 11 : 12} height="100%" padding="0 16px" disabled>
				<IconBiPencilFill/>
				{t('common.action.edit')}
			</Link>
			<Link size={isCompact ? 11 : 12} height="100%" padding="0 16px" disabled>
				<IconBiTrash3Fill/>
				{t('common.action.delete')}
			</Link>
		</Grid>
    </Grid>;
};