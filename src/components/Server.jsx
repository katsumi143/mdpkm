import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import ImagePreview from './ImagePreview';

import Patcher from '/src/common/plugins/patcher';
export default Patcher.register(function Server({ name, icon, motd, type, players, address, instanceId, acceptTextures }) {
    const { t } = useTranslation();
    const isCompact = useSelector(state => state.settings.uiStyle) === 'compact';
    const [previewIcon, setPreviewIcon] = useState(false);
    
    const iconSize = isCompact ? 38 : 46;
    const serverIcon = icon ? icon.startsWith('data:') ? icon : `data:image/png;base64,${icon}` : 'img/icons/minecraft/unknown_server.png';
    return <Grid height="fit-content" padding={8} spacing={12} background="$secondaryBackground2" borderRadius={8} justifyContent="space-between" css={{
        minWidth: '24rem'
    }}>
        <Grid spacing={isCompact ? 10 : 12}>
            <Image
                src={serverIcon}
                size={iconSize}
                onClick={() => setPreviewIcon(true)}
                background="$secondaryBackground"
                borderRadius={4}
                css={{
                    cursor: 'zoom-in',
                    boxShadow: '$buttonShadow'
                }}
            />
            {previewIcon && <ImagePreview src={serverIcon} size={192} onClose={() => setPreviewIcon(false)} pixelated/>}
            <Grid height="100%" spacing={2} direction="vertical" justifyContent="center">
                <Typography size={isCompact ? 14 : 16} horizontal lineheight={1} whitespace="nowrap">
                    {name || t('app.mdpkm.server.default_name')}
                    {acceptTextures === 1 &&
                        <Typography size={isCompact ? 10 : '.7rem'} color="$secondaryColor" weight={300} margin="4px 0 0 8px" lineheight={1}>
                            {t('app.mdpkm.server.textures_accepted')}
                        </Typography>
                    }
                </Typography>
                {motd ?
                    <span dangerouslySetInnerHTML={{ __html: motd }} style={{
                        fontSize: '.8rem',
                        textAlign: 'center',
                        fontFamily: 'Nunito'
                    }}/>
                :
                    <Typography size={isCompact ? 10 : 12} color="$secondaryColor" lineheight={1}>
                        {address || t('app.mdpkm.server.no_address')}
                    </Typography>
                }
            </Grid>
        </Grid>
        <Grid spacing={8} alignItems="center">
            <Grid height="100%" spacing={4} padding={4} direction="vertical" alignItems="end">
                {players && <Typography size=".8rem" color="$secondaryColor" spacing={4} lineheight={1}>
                    {t('app.mdpkm.server.players', {
                        val: players.online,
                        max: players.max
                    })}
                </Typography>}
                {type && <Typography size=".8rem" color="$secondaryColor" spacing={4} lineheight={1}>
                    {type}
                </Typography>}
            </Grid>
            {instanceId && <React.Fragment>
                <Button theme="secondary" disabled>
                    <IconBiPencilFill style={{fontSize: 11}}/>
                    {t('app.mdpkm.common:actions.edit')}
                </Button>
                <Button theme="secondary" disabled>
                    <IconBiTrash3Fill style={{fontSize: 11}}/>
                    {t('app.mdpkm.common:actions.delete')}
                </Button>
            </React.Fragment>}
        </Grid>
    </Grid>;
});