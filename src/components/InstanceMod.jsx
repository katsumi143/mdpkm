import { Breakpoint } from 'react-socks';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Tag from './Tag';
import Grid from '/voxeliface/components/Grid';
import Modal from './Modal';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import HeaderText from '/voxeliface/components/Typography/Header';
import ImagePreview from './ImagePreview';

import API from '../common/api';
import Util from '../common/util';
import Patcher from '/src/common/plugins/patcher';
import { useInstance } from '../voxura';
export default Patcher.register(function InstanceMod({ mod, updates, embedded, instanceId }) {
    const { t } = useTranslation();
    const update = updates?.[mod?.config?.[1]];
    const instance = useInstance(instanceId);
    const isCompact = useSelector(state => state.settings.uiStyle) === 'compact';
    const sourceApi = API.get(mod?.source);
    const loaderData = API.getLoader(mod?.loader);
    const [showInfo, setShowInfo] = useState(false);
    const [previewIcon, setPreviewIcon] = useState(false);
    const [showEmbedded, setShowEmbedded] = useState(false);
    const toggleEmbedded = () => setShowEmbedded(!showEmbedded);
    const deleteMod = () => Instances.getInstance(instanceId).deleteMod(mod.id);

    const tagSize = isCompact ? 9.25 : '.6rem';
    const iconSize = embedded ? isCompact ? 24 : 32 : isCompact ? 32 : 40;
    return (
        <Grid direction="vertical">
            <Grid padding={8} spacing={8} direction="vertical" background="$secondaryBackground2" borderRadius={8} css={{
                position: 'relative',
                borderBottomLeftRadius: showEmbedded ? 0 : null,
                borderBottomRightRadius: showEmbedded ? 0 : null
            }}>
                <Grid width="100%" spacing={isCompact ? 4 : 8} onClick={() => setShowInfo(true)} alignItems="center" css={{
                    '&:hover': {
                        cursor: 'pointer'
                    }
                }}>
                    <Image src={mod.webIcon} size={iconSize} background="$secondaryBackground" borderRadius="8.33333333%" css={{
                        minWidth: iconSize,
                        minHeight: iconSize,
                        boxShadow: '$buttonShadow',
                        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                        imageRendering: 'pixelated'
                    }}/>
                    <Grid margin="0 0 0 4px" spacing={2} direction="vertical">
                        <Typography size={embedded ? '.9rem' : isCompact ? 14 : '1rem'} weight={400} lineheight={1}>
                            {mod.name ?? mod.id}
                        </Typography>
                        <Typography size={embedded ? '.6rem' : isCompact ? 10 : '.7rem'} color="$secondaryColor" weight={300} lineheight={1}>
                            {t('app.mdpkm.mod.version', {
                                val: mod.version
                            })}
                            {update && ' (Update available)'}
                        </Typography>
                    </Grid>
                    <Grid spacing={8} alignItems="center" css={{
                        right: '1rem',
                        position: 'absolute'
                    }}>
                        {embedded &&
                            <Tag>
                                <Typography size={tagSize} color="$tagColor">
                                    {t('app.mdpkm.mod.tags.embedded')}
                                </Typography>
                            </Tag>
                        }
                        <Breakpoint customQuery="(min-width: 820px)">
                            <Tag>
                                {sourceApi?.icon && <Image src={sourceApi?.icon} size={12} borderRadius={4}/>}
                                <Typography size={tagSize} color="$tagColor">
                                    {Util.getPlatformName(mod.source)}
                                </Typography>
                            </Tag>
                        </Breakpoint>
                        <Breakpoint customQuery="(min-width: 690px)">
                            {!update && <Tag>
                                {loaderData?.icon && <Image src={loaderData?.icon} size={12}/>}
                                <Typography size={tagSize} color="$tagColor">
                                    {Util.getLoaderName(mod?.loader)?.split(" ")?.[0]} {mod.gameVersion}
                                </Typography>
                            </Tag>}
                        </Breakpoint>
                        {update && <Button size={isCompact ? 'smaller' : 'small'} theme="accent" disabled>
                            <IconBiCloudArrowDown size={14}/>
                            Update
                        </Button>}
                        {!embedded && <Button size={isCompact ? 'smaller' : 'small'} theme="secondary" onClick={deleteMod}>
                            <IconBiTrash3Fill/>
                            <Breakpoint customQuery="(min-width: 580px)">
                                {t('app.mdpkm.common:actions.delete')}
                            </Breakpoint>
                        </Button>}
                    </Grid>
                </Grid>
                {mod.embedded?.length > 0 &&
                    <Typography size={isCompact ? 10 : '.8rem'} color="$secondaryColor" horizontal onClick={() => toggleEmbedded()} lineheight={1} css={{
                        width: 'fit-content',
                        cursor: 'pointer'
                    }}>
                        <IconBiCaretDownFill color="var(--colors-secondaryColor)" style={{
                            transform: showEmbedded ? 'rotate(180deg)' : 'none',
                            marginRight: 4
                        }}/>
                        {t(`app.mdpkm.mod.${showEmbedded ? 'hide': 'show'}_embedded`, {
                            val: mod.embedded.length
                        })}
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
            {showInfo &&
                <Modal width="60%" height="50%">
                    <HeaderText>Modification Information</HeaderText>
                    <Grid padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={8}>
                        <Image src={mod.webIcon} size={48} onClick={() => setPreviewIcon(true)} background="$secondaryBackground" borderRadius={4} css={{
                            cursor: 'zoom-in',
                            boxShadow: '$buttonShadow',
                            imageRendering: 'pixelated'
                        }}/>
                        {previewIcon && <ImagePreview src={mod.webIcon} size={192} onClose={() => setPreviewIcon(false)}/>}
                        <Grid spacing={2} direction="vertical">
                            <Typography size="1.1rem" lineheight={1}>
                                {mod.name}
                            </Typography>
                            <Typography size={12} color="$secondaryColor" lineheight={1}>
                                Version {mod.version}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid margin="8px 0 0" padding={8} direction="vertical" background="$secondaryBackground2" borderRadius={8}>
                        <Typography>
                            Summary
                        </Typography>
                        <Typography size={12} color="$secondaryColor">
                            {mod.metadata.description}
                        </Typography>
                    </Grid>
                    <Button onClick={() => setShowInfo(false)}>close</Button>
                </Modal>
            }
        </Grid>
    );
});