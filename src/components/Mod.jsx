import { open } from '@tauri-apps/api/shell';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Patcher from '/src/common/plugins/patcher';
import { useInstance } from '../common/voxura';
export default Patcher.register(function Mod({ id, api, data, featured, instanceId, recommended }) {
    const { t } = useTranslation();
    const instance = useInstance(instanceId);
    const isCompact = useSelector(state => state.settings.uiStyle) === 'compact';
    const showSummary = useSelector(state => state.settings['instances.modSearchSummaries']);
    const [mod, setMod] = useState(data);
    const { config, downloading } = instance ?? {};
    const installed = config?.modifications?.some(m => m[3] === mod?.slug);
    const installing = downloading?.some(d => d.id === (mod?.id ?? mod?.project_id));
    const installMod = () => Instances.getInstance(instanceId).downloadMod(
        mod?.id ?? mod?.project_id,
        mod.source ? API.get(mod.source) : API.Modrinth
    );
    useEffect(() => {
        if(id && typeof api === 'string' && !mod)
            API.get(api).Mods.get(id).then(setMod).catch(err => {
                console.warn(err);
                let message = 'An unknown error occured.';
                if (err.message.includes(503))
                    message = 'The service is unavailable.';
                setMod(`error:${message}`);
            });
    }, [id, api, mod]);
    useEffect(() => {
        if(data && data !== mod)
            setMod(data);
    }, [data]);

    const iconSize = isCompact ? 32 : 44;
    return (
        <Grid padding={8} background="$secondaryBackground2" borderRadius={8} css={{ position: 'relative' }}>
            {mod ? mod.startsWith?.('error') ? <Grid width="100%" spacing={12} padding={4} css={{ position: 'relative' }}>
                <IconBiXLg size={24} color="var(--colors-secondaryColor)"/>
                <Grid width="100%" spacing={2} direction="vertical" justifyContent="center">
                    <Typography size=".9rem" lineheight={1}>
                        {mod.split(':')[1]}
                    </Typography>
                    {id && api &&
                        <Typography size=".7rem" color="$secondaryColor" weight={400} lineheight={1}>
                            {id} on {t(`app.mdpkm.common:platforms.${api}`)}.
                        </Typography>
                    }
                    <Button theme="accent" onClick={() => setMod()} css={{
                        right: 8,
                        position: 'absolute'
                    }}>
                        <IconBiArrowClockwise size={14}/>
                        {t('app.mdpkm.common:actions.retry')}
                    </Button>
                </Grid>
            </Grid> : <React.Fragment>
                <Image src={mod.icon} size={iconSize} background="$secondaryBackground" borderRadius={4} css={{
                    minWidth: iconSize,
                    minHeight: iconSize,
                    boxShadow: '$buttonShadow',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                    '&:hover': {
                        minWidth: iconSize * 2,
                        minHeight: iconSize * 2
                    }
                }}/>
                <Grid margin="4px 0 0 12px" padding="2px 0" spacing="2px" direction="vertical">
                    <Typography size={isCompact ? 14 : '1.1rem'} spacing={4} horizontal lineheight={1} css={{
                        width: 'fit-content'
                    }}>
                        {mod.title}
                        {mod.author && 
                            <Typography size={isCompact ? 10 : '.7rem'} color="$secondaryColor" lineheight={1}>
                                {t('app.mdpkm.mod.author', { val: mod.author })}
                            </Typography>
                        }
                        {featured &&
                            <Typography size=".8rem" color="#cbc365" lineheight={1}>
                                {t('app.mdpkm.mod.featured')}
                            </Typography>
                        }
                        {recommended &&
                            <Typography size=".8rem" color="$secondaryColor" lineheight={1}>
                                {t('app.mdpkm.mod.recommended')}
                            </Typography>
                        }
                    </Typography>
                    {!isCompact && <Typography size=".8rem" color="$secondaryColor" weight={400} lineheight={1}>
                        {t(`app.mdpkm.mod.sides.${mod.getSide()}`)}
                    </Typography>}
                    {showSummary && <Typography size={isCompact ? 12 : '.9rem'} color="$secondaryColor" textalign="left" whitespace="pre-wrap">
                        {mod.summary}
                    </Typography>}
                </Grid>
                <Grid spacing={8} css={{
                    right: 8,
                    position: 'absolute'
                }}>
                    {typeof mod.downloads === 'number' &&
                        <Typography size={isCompact ? 12 : 16} margin="0 8px 0 0" spacing={4} horizontal>
                            {Intl.NumberFormat('en-us', {}).format(mod.downloads)}
                            <Typography size={isCompact ? 10 : '.8rem'} color="$secondaryColor">
                                {t('app.mdpkm.mod.downloads')}
                            </Typography>
                        </Typography>
                    }
                    {mod.website &&
                        <Button size={isCompact ? 'smaller' : 'small'} theme="secondary" onClick={() => open(mod.website)}>
                            <IconBiBoxArrowUpRight/>
                            {t('app.mdpkm.common:actions.visit_website')}
                        </Button>
                    }
                    {instance &&
                        <Button size={isCompact ? 'smaller' : 'small'} onClick={installMod} disabled={mod.client_side === "unsupported" || installing || downloading?.length > 0 || installed}>
                            {(installing || downloading?.length > 0) ?
                                <BasicSpinner size={16}/> : <IconBiDownload/>
                            }
                            {installed ? t('app.mdpkm.common:states.installed') : mod.client_side === "unsupported" ? t('app.mdpkm.common:states.unavailable') :
                                installing ? t('app.mdpkm.common:states.installing') : downloading?.length > 0 ? t('app.mdpkm.common:states.waiting') : t('app.mdpkm.common:actions.install')
                            }
                        </Button>
                    }
                </Grid>
            </React.Fragment> : <Grid spacing={12} padding={4}>
                <Spinner/>
                <Grid spacing={2} direction="vertical" justifyContent="center">
                    <Typography size=".9rem" lineheight={1}>
                        {t('app.mdpkm.common:states.loading')}
                    </Typography>
                    {id && api &&
                        <Typography size=".7rem" color="$secondaryColor" weight={400} lineheight={1}>
                            {t('app.mdpkm.mod.platform', {
                                id,
                                name: t(`app.mdpkm.common:platforms.${api}`)
                            })}
                        </Typography>
                    }
                </Grid>
            </Grid>}
        </Grid>
    );
});