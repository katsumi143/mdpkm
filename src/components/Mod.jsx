import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { open } from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';
import { XLg, Download, ArrowClockwise, BoxArrowUpRight } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Instances from '../common/instances';
export default function Mod({ id, api, data, featured, instanceId, recommended }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const [mod, setMod] = useState(data);
    const { config, downloading } = instance ?? {};
    const installed = config?.modifications.some(m => m[3] === mod?.slug);
    const installing = downloading?.some(d => d.id === (mod?.id ?? mod?.project_id));
    const installMod = () => Instances.getInstance(instanceId).downloadMod(
        mod?.id ?? mod?.project_id,
        mod.source ? API.get(mod.source) : API.Modrinth
    );
    useEffect(() => {
        if(id && typeof api === 'string' && !mod)
            API.get(api).Mods.get(id).then(setMod).catch(err => {
                console.warn(err);
                setMod('error');
            });
    }, [id, api, mod]);
    useEffect(() => {
        if(data && data !== mod)
            setMod(data);
    }, [data]);

    return (
        <Grid padding={8} background="$secondaryBackground2" borderRadius={8} css={{ position: 'relative' }}>
            {mod ? mod === 'error' ? <Grid width="100%" spacing={12} padding={4} css={{ position: 'relative' }}>
                <XLg size={24} color="var(--colors-secondaryColor)"/>
                <Grid width="100%" spacing={2} direction="vertical" justifyContent="center">
                    <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                        An error occured.
                    </Typography>
                    {id && api &&
                        <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                            {id} on {t(`app.mdpkm.common:platforms.${api}`)}.
                        </Typography>
                    }
                    <Button theme="accent" onClick={() => setMod()} css={{
                        right: 8,
                        position: 'absolute'
                    }}>
                        <ArrowClockwise size={14}/>
                        {t('app.mdpkm.common:actions.retry')}
                    </Button>
                </Grid>
            </Grid> : <React.Fragment>
                <Image src={mod.icon} size={48} background="$secondaryBackground" borderRadius={4} css={{
                    minWidth: 48,
                    minHeight: 48,
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                    '&:hover': {
                        minWidth: 64,
                        minHeight: 64
                    }
                }}/>
                <Grid margin="4px 0 0 12px" padding="2px 0" spacing="2px" direction="vertical">
                    <Typography size="1.1rem" color="$primaryColor" family="Nunito" lineheight={1}>
                        {mod.title}
                        {mod.author && 
                            <Typography size=".7rem" color="$secondaryColor" margin="4px 0 0 4px" lineheight={1}>
                                {t('app.mdpkm.mod.author', { val: mod.author })}
                            </Typography>
                        }
                        {featured &&
                            <Typography size=".8rem" color="#cbc365" margin="2px 0 0 6px" lineheight={1}>
                                {t('app.mdpkm.mod.featured')}
                            </Typography>
                        }
                        {recommended &&
                            <Typography size=".8rem" color="$secondaryColor" margin="2px 0 0 6px" lineheight={1}>
                                {t('app.mdpkm.mod.recommended')}
                            </Typography>
                        }
                    </Typography>
                    <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        {t(`app.mdpkm.mod.sides.${mod.getSide()}`)}
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" family="Nunito" textalign="left">
                        {mod.summary}
                    </Typography>
                </Grid>
                <Grid spacing={8} css={{
                    right: 8,
                    position: 'absolute'
                }}>
                    {typeof mod.downloads === 'number' &&
                        <Typography color="$primaryColor" margin="0 8px 0 0" family="Nunito">
                            {Intl.NumberFormat('en-us', {}).format(mod.downloads)}
                            <Typography size=".8rem" color="$secondaryColor" family="Nunito" margin="0 0 0 4px">
                                {t('app.mdpkm.mod.downloads')}
                            </Typography>
                        </Typography>
                    }
                    {mod.website &&
                        <Button theme="secondary" onClick={() => open(mod.website)}>
                            <BoxArrowUpRight/>
                            {t('app.mdpkm.common:actions.visit_website')}
                        </Button>
                    }
                    {instance &&
                        <Button onClick={installMod} disabled={mod.client_side === "unsupported" || installing || downloading?.length > 0 || installed}>
                            {(installing || downloading?.length > 0) ?
                                <BasicSpinner size={16}/> : <Download/>
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
                    <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                        {t('app.mdpkm.common:states.loading')}
                    </Typography>
                    {id && api &&
                        <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
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
};