import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Trash3Fill, CaretDownFill, ExclamationCircleFill } from 'react-bootstrap-icons';

import Tag from './Tag';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';

import API from '../common/api';
import Util from '../common/util';
import Instances from '../common/instances';

export default function InstanceMod({ mod, embedded, instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const sourceApi = API.get(mod?.source);
    const loaderData = API.getLoader(mod?.loader);
    const [showEmbedded, setShowEmbedded] = useState(false);
    const toggleEmbedded = () => setShowEmbedded(!showEmbedded);
    const deleteMod = () => Instances.getInstance(instanceId).deleteMod(mod.id);
    return (
        <Grid direction="vertical">
            <Grid padding={8} spacing={8} direction="vertical" background="$secondaryBackground2" borderRadius={8} css={{
                position: 'relative',
                borderBottomLeftRadius: showEmbedded ? 0 : null,
                borderBottomRightRadius: showEmbedded ? 0 : null
            }}>
                <Grid width="100%" spacing={8} alignItems="center">
                    {mod.icon ?
                        <Image src={`data:image/png;base64,${mod.icon}`} size={embedded ? 32 : 40} background="$secondaryBackground" borderRadius="8.33333333%" css={{
                            minWidth: embedded ? 32 : 40,
                            minHeight: embedded ? 32 : 40,
                            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                            imageRendering: 'pixelated',

                            '&:hover': {
                                minWidth: 64,
                                minHeight: 64
                            }
                        }}/>
                    : <Grid width={embedded ? 32 : 40} height={embedded ? 32 : 40} alignItems="center" background="$secondaryBackground" borderRadius={4} justifyContent="center">
                        <ExclamationCircleFill size={embedded ? 16 : 20} color="#ffffff80"/>
                    </Grid>}
                    <Grid margin="0 0 0 4px" spacing={2} direction="vertical">
                        <Typography size={embedded ? ".9rem" : "1rem"} color="$primaryColor" weight={400} family="Nunito" lineheight={1}>
                            {mod.name ?? mod.id}
                        </Typography>
                        <Typography size={embedded ? ".6rem" : ".7rem"} color="$secondaryColor" weight={300} family="Nunito" lineheight={1}>
                            Version {mod.version}
                        </Typography>
                    </Grid>
                    <Grid spacing={8} alignItems="center" css={{
                        right: '1rem',
                        position: 'absolute'
                    }}>
                        {embedded &&
                            <Tag>
                                <Typography size=".6rem" color="$tagColor" family="Nunito">
                                    Embedded
                                </Typography>
                            </Tag>
                        }
                        <Tag>
                            {sourceApi?.icon && <Image src={sourceApi?.icon} size={12} borderRadius={4}/>}
                            <Typography size=".6rem" color="$tagColor" family="Nunito">
                                {Util.getPlatformName(mod.source)}
                            </Typography>
                        </Tag>
                        <Tag>
                            {loaderData?.icon && <Image src={loaderData?.icon} size={12}/>}
                            <Typography size=".6rem" color="$tagColor" family="Nunito">
                                {Util.getLoaderName(mod?.loader)?.split(" ")?.[0]} {mod.gameVersion}
                            </Typography>
                        </Tag>
                        {!embedded && <Button theme="secondary" onClick={deleteMod}>
                            <Trash3Fill/>
                            {t('app.mdpkm.common:actions.delete')}
                        </Button>}
                    </Grid>
                </Grid>
                {mod.embedded?.length > 0 &&
                    <Typography size=".8rem" color="$secondaryColor" family="Nunito" onClick={() => toggleEmbedded()} lineheight={1} css={{
                        cursor: 'pointer'
                    }}>
                        <CaretDownFill color="var(--colors-secondaryColor)" style={{
                            transform: showEmbedded ? 'rotate(180deg)' : 'none',
                            marginRight: 4
                        }}/>
                        {showEmbedded ? 'Hide' : 'Show'} Embedded Mods ({mod.embedded.length})
                    </Typography>
                }
            </Grid>
            {showEmbedded &&
                <Grid padding={8} spacing={8} direction="vertical" background="#0000004d" borderRadius="0 0 4px 4px">
                    {mod.embedded?.map((mod, index) =>
                        <InstanceMod key={index} mod={mod} instance={instance} embedded/>
                    )}
                </Grid>
            }
        </Grid>
    );
};