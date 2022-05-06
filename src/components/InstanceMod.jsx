import React, { useState } from 'react';
import { Trash3Fill, CaretDownFill, ExclamationCircleFill } from 'react-bootstrap-icons';

import Tag from './Tag';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';

import Instances from '../common/instances';
import { LoaderNames, LoaderIcons, PlatformNames, PlatformIcons, PlatformIndex } from '../common/constants';

export default function InstanceMod({ mod, instance, embedded }) {
    const Instance = Instances.instances[instance];
    const [showEmbedded, setShowEmbedded] = useState(false);
    const toggleEmbedded = () => setShowEmbedded(!showEmbedded);
    console.log(mod);
    return (
        <Grid direction="vertical">
            <Grid padding="8px" spacing="8px" direction="vertical" background="$secondaryBackground2" borderRadius={8} css={{
                position: 'relative',
                borderBottomLeftRadius: showEmbedded ? 0 : null,
                borderBottomRightRadius: showEmbedded ? 0 : null
            }}>
                <Grid width="100%" spacing="8px" alignItems="center">
                    {mod.icon ?
                        <Image src={`data:image/png;base64,${mod.icon}`} size={embedded ? 32 : 40} background="$secondaryBackground" borderRadius="8.33333333%" css={{
                            imageRendering: 'pixelated'
                        }}/>
                    : <Grid width={embedded ? 32 : 40} height={embedded ? 32 : 40} alignItems="center" background="$secondaryBackground" borderRadius="4px" justifyContent="center">
                        <ExclamationCircleFill size={embedded ? 16 : 20} color="#ffffff80"/>
                    </Grid>}
                    <Grid margin="0 0 0 4px" spacing="2px" direction="vertical">
                        <Typography size={embedded ? ".9rem" : "1rem"} color="$primaryColor" weight={400} family="Nunito" lineheight={1}>
                            {mod.name ?? mod.id}
                        </Typography>
                        <Typography size={embedded ? ".6rem" : ".7rem"} color="$secondaryColor" weight={300} family="Nunito" lineheight={1}>
                            Version {mod.version}
                        </Typography>
                    </Grid>
                    <Grid spacing="8px" alignItems="center" css={{
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
                        {typeof mod.source === 'number' &&
                            <Tag>
                                <Image src={PlatformIcons[PlatformIndex[mod.source]]} size="12px" borderRadius={4}/>
                                <Typography size=".6rem" color="$tagColor" family="Nunito">
                                    {PlatformNames[PlatformIndex[mod.source]]}
                                </Typography>
                            </Tag>
                        }
                        <Tag>
                            {LoaderIcons[mod.loader] && <Image src={LoaderIcons[mod.loader]} size="12px"/>}
                            <Typography size=".6rem" color="$tagColor" family="Nunito">
                                {LoaderNames[mod.loader]?.split(" ")?.[0] ?? "Unknown Loader"} {mod.gameVersion}
                            </Typography>
                        </Tag>
                        {!embedded && <Button theme="secondary" onClick={() => Instance.deleteMod(mod.id)}>
                            <Trash3Fill/>
                            Delete
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
                <Grid padding="8px" spacing="8px" direction="vertical" background="#0000004d" borderRadius="0 0 4px 4px">
                    {mod.embedded?.map((mod, index) =>
                        <InstanceMod key={index} mod={mod} instance={instance} embedded/>
                    )}
                </Grid>
            }
        </Grid>
    );
};