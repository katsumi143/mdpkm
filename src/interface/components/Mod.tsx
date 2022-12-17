import { open } from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import ImageWrapper from './ImageWrapper';
import { Grid, Button, Spinner, Typography, BasicSpinner } from 'voxeliface';

import Patcher from '../../plugins/patcher';
import { ModSide } from '../../../voxura/src/platforms/mod';
import { useInstance } from '../../voxura';
import { useAppSelector } from '../../store/hooks';
import type { Mod, Platform } from '../../../voxura';
export type ModProps = {
    id?: string,
    data?: Mod,
    featured?: boolean,
	platform?: Platform,
    instanceId?: string,
    recommended?: boolean
};
export default Patcher.register(function Mod({ id, data, featured, platform, instanceId, recommended }: ModProps) {
    const { t } = useTranslation('interface');
    const instance = useInstance(instanceId!);
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const showSummary = useAppSelector(state => state.settings['instances.modSearchSummaries']);
    const [mod, setMod] = useState(data);
    const [loading, setLoading] = useState(!data);
    const installed = false;//store?.modifications?.some(m => m[3] === mod?.slug);
    const installing = false;//downloading?.some(d => d.id === (mod?.id ?? mod?.project_id));
    const installMod = () => instance?.installMod(mod!);
    useEffect(() => {
        if(id && platform && !mod)
			platform.getMod(id).then(mod => {
				setMod(mod);
				setLoading(false);
			}).catch(err => {
                console.warn(err);
                let message = 'An unknown error occured.';
                if (err.message.includes(503))
                    message = 'The service is unavailable.';
            });
    }, [id, mod, platform]);
    useEffect(() => {
        if(data && data !== mod)
            setMod(data);
    }, [data]);
	console.log(mod);

    const iconSize = isCompact ? 32 : 44;
    return <Grid padding={8} background="$secondaryBackground2" borderRadius={16} css={{
        border: 'transparent solid 1px',
        position: 'relative',
        background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
    }}>
        {loading || !mod ? <Grid spacing={12} padding={4}>
            <Spinner/>
            <Grid spacing={2} vertical justifyContent="center">
                <Typography size={14} lineheight={1}>
                    {t('app.mdpkm.common:states.loading')}
                </Typography>
                {id && platform &&
                    <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
                        {t('app.mdpkm.mod.platform', {
                            id,
                            name: t(`app.mdpkm.common:platforms.${platform.id}`)
                        })}
                    </Typography>
                }
            </Grid>
        </Grid> : <React.Fragment>
            <ImageWrapper src={mod.webIcon} size={iconSize} shadow canPreview background="$secondaryBackground" borderRadius={8} css={{
                filter: mod.isNsfw && 'blur(2px)',
                minWidth: iconSize
            }}/>
            <Grid margin={isCompact ? '4px 0 0 10px' : '4px 0 0 12px'} padding="2px 0" spacing={2} vertical>
                <Typography size={isCompact ? 14 : '1.1rem'} spacing={4} lineheight={1}>
                    {mod.displayName}
                    {mod.author && 
                        <Typography size={isCompact ? 10 : 12} color="$secondaryColor" family="$secondary" lineheight={1}>
                            {t('mod.author', [mod.author])}
                        </Typography>
                    }
                    {featured &&
                        <Typography size={14} color="#cbc365" lineheight={1}>
                            {t('mod.featured')}
                        </Typography>
                    }
                    {recommended &&
                        <Typography size={14} color="$secondaryColor" lineheight={1}>
                            {t('mod.recommended')}
                        </Typography>
                    }
                    {mod.isNsfw &&
                        <Typography size={14} color="#e18e8e" lineheight={1}>
                            {t('mod.explict')}
                        </Typography>
                    }
                </Typography>
                {!isCompact && <Typography size={12} color="$secondaryColor" weight={400} lineheight={1}>
                    {t(`mod.side.${mod.getSide()}`)}
                </Typography>}
                {showSummary && <Typography size={isCompact ? 12 : 14} color="$secondaryColor" weight={400} family="$secondary" textalign="left" whitespace="pre-wrap">
                    {mod.summary}
                </Typography>}
            </Grid>
            <Grid spacing={8} css={{
                right: 8,
                position: 'absolute'
            }}>
                {typeof mod.downloads === 'number' &&
                    <Typography size={isCompact ? 11 : 12} color="$secondaryColor" margin="0 8px 0 0" spacing={6}>
                        <IconBiDownload/>
                        {t('mod.downloads', [mod.downloads])}
                    </Typography>
                }
                {mod.website &&
                    <Button size={isCompact ? 'smaller' : 'small'} theme="secondary" onClick={() => open(mod.website)}>
                        <IconBiBoxArrowUpRight/>
                        {t('common.action.visit_website')}
                    </Button>
                }
                <Button size={isCompact ? 'smaller' : 'small'} theme="accent" onClick={installMod} disabled={mod.getSide() === ModSide.Unknown || installing || installed}>
                    {installing ?
                        <BasicSpinner size={16}/> : <IconBiDownload/>
                    }
                    {installed ? t('app.mdpkm.common:states.installed') : mod.getSide() === ModSide.Unknown ? t('app.mdpkm.common:states.unavailable') :
                        installing ? t('app.mdpkm.common:states.installing') : t('common.action.install')
                    }
                </Button>
            </Grid>
        </React.Fragment>}
    </Grid>;
});