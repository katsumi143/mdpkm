import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Grid, Typography } from 'voxeliface';

import Avatar from '../../Avatar';

import { i } from '../../../../util';
import type { Instance } from '../../../../../voxura';
export interface ServerItemProps {
	name: string
	icon?: string
	motd?: string
	type?: string
	players?: any
	address?: string
	instance?: Instance
	acceptTextures?: number
}
export default function ServerItem({ name, icon, motd, type, players, address, instance, acceptTextures }: ServerItemProps) {
    const { t } = useTranslation('interface');
    const serverIcon = icon ? icon.startsWith('data:') ? icon : `data:image/png;base64,${icon}` : i('unknown_server');
    return <Grid height="fit-content" spacing={12} smoothing={1} borderRadius={16} css={{
		border: 'transparent solid 1px',
		minWidth: '24rem',
		position: 'relative',
		background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
    }}>
        <Grid spacing={12}>
			<Avatar src={serverIcon} size="sm" margin="8px 0 8px 8px"/>
            <Grid height="100%" spacing={2} vertical justifyContent="center">
                <Typography size={15} weight={450} noSelect lineheight={1} whitespace="nowrap">
                    {name || t('server.no_name')}
                    {acceptTextures &&
                        <Typography size={12} color="$secondaryColor" family="$secondary" margin="2px 0 0" noSelect lineheight={1}>
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
                    <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
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
			{instance && <>
				<Link size={12} height="100%" padding="0 16px" disabled>
					<IconBiPencilFill/>
					{t('common.action.edit')}
				</Link>
				<Link size={12} height="100%" padding="0 16px" disabled>
					<IconBiTrash3Fill/>
					{t('common.action.delete')}
				</Link>
			</>}
		</Grid>
    </Grid>;
}