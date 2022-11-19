import { Breakpoint } from 'react-socks';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Modal from './Modal';
import ImagePreview from './ImagePreview';
import { Link, Grid, Image, Button, Typography, TextHeader } from '../../../voxeliface';

import Patcher from '../../plugins/patcher';
import type Mod from '../../../voxura/src/util/mod';
import { useInstance } from '../../voxura';
import { useAppSelector } from '../../store/hooks';
export type InstanceModProps = {
    mod?: Mod,
    updates?: any[],
    embedded?: boolean,
    instanceId?: string
};
export default Patcher.register(function InstanceMod({ mod, updates, embedded, instanceId }: InstanceModProps) {
    const { t } = useTranslation();
    const update = null;//updates?.[mod?.config?.[1]];
    const instance = useInstance(instanceId ?? '');
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const [showInfo, setShowInfo] = useState(false);
    const [previewIcon, setPreviewIcon] = useState(false);
    const [showEmbedded, setShowEmbedded] = useState(false);
    const toggleEmbedded = () => setShowEmbedded(!showEmbedded);
    const deleteMod = () => null;
    if (!instance)
        throw new Error('could not find instance');

    const iconSize = embedded ? isCompact ? 24 : 32 : isCompact ? 32 : 40;
    return <Grid direction="vertical">
        <Grid spacing={8} direction="vertical" background="$secondaryBackground2" borderRadius={16} css={{
            border: 'transparent solid 1px',
            position: 'relative',
            background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
            borderBottomLeftRadius: showEmbedded ? 0 : null,
            borderBottomRightRadius: showEmbedded ? 0 : null
        }}>
            <Grid width="100%" spacing={isCompact ? 4 : 8} onClick={() => setShowInfo(true)} alignItems="center" css={{
                '&:hover': {
                    cursor: 'pointer'
                }
            }}>
                <Image src={mod?.webIcon} size={iconSize} margin="8px 0 8px 8px" background="$secondaryBackground" borderRadius={8} css={{
                    minWidth: iconSize,
                    minHeight: iconSize,
                    boxShadow: '$buttonShadow',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    imageRendering: 'pixelated'
                }}/>
                <Grid margin="0 0 0 4px" spacing={2} vertical>
                    <Typography size={embedded ? '.9rem' : isCompact ? 14 : 16} weight={400} lineheight={1}>
                        {mod?.name ?? mod?.id}
                    </Typography>
                    <Typography size={embedded ? '.6rem' : isCompact ? 10 : 12} color="$secondaryColor" weight={300} lineheight={1}>
                        {t('app.mdpkm.mod.version', {
                            val: mod?.version
                        })}
                        {update && ' (Update available)'}
                    </Typography>
                </Grid>
                <Grid spacing={8} alignItems="center" css={{
                    right: 0,
                    position: 'absolute'
                }}>
                    <Grid vertical alignItems="end">
                        <Breakpoint customQuery="(min-width: 820px)">
                            <Typography size={12} color="$secondaryColor" spacing={6} horizontal>
                                <IconBiCloudFill/>
                                {t('app.mdpkm.common:platforms.local')}
                            </Typography>
                        </Breakpoint>
                        <Breakpoint customQuery="(min-width: 690px)">
                            {!update && <Typography size={12} color="$secondaryColor" spacing={6} horizontal>
                                <IconBiBoxFill fontSize={10}/>
                                {t(`app.mdpkm.common:loader.${mod?.loader}`)}
                            </Typography>}
                        </Breakpoint>
                    </Grid>
                    {update && <Button size={isCompact ? 'smaller' : 'small'} theme="accent" disabled>
                        <IconBiCloudArrowDown/>
                        Update
                    </Button>}
                    {!embedded && <Link size={isCompact ? 11 : 12} padding="0 16px" onClick={deleteMod}>
                        <IconBiTrash3Fill/>
                        <Breakpoint customQuery="(min-width: 580px)">
                            {t('app.mdpkm.common:actions.delete')}
                        </Breakpoint>
                    </Link>}
                </Grid>
            </Grid>
            {/*mod?.embedded?.length > 0 &&
                <Typography size={isCompact ? 10 : '.8rem'} color="$secondaryColor" horizontal onClick={() => toggleEmbedded()} lineheight={1} css={{
                    width: 'fit-content',
                    cursor: 'pointer'
                }}>
                    <IconBiCaretDownFill color="var(--colors-secondaryColor)" style={{
                        transform: showEmbedded ? 'rotate(180deg)' : 'none',
                        marginRight: 4
                    }}/>
                    {t(`app.mdpkm.mod.${showEmbedded ? 'hide': 'show'}_embedded`, {
                        //val: mod.embedded.length
                    })}
                </Typography>
            */}
        </Grid>
        {showEmbedded &&
            <Grid padding={8} spacing={8} direction="vertical" background="#0000004d" borderRadius="0 0 4px 4px">
                {/*mod.embedded?.map((mod: any, index: number) =>
                    <InstanceMod key={index} mod={mod} instanceId={instanceId} embedded/>
                )*/}
            </Grid>
        }
        {showInfo &&
            <Modal width="60%" height="50%">
                <TextHeader>Modification Information</TextHeader>
                <Grid padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={8}>
                    <Image src={mod?.webIcon} size={48} onClick={() => setPreviewIcon(true)} background="$secondaryBackground" borderRadius={4} css={{
                        cursor: 'zoom-in',
                        boxShadow: '$buttonShadow',
                        imageRendering: 'pixelated'
                    }}/>
                    {previewIcon && <ImagePreview src={mod?.webIcon} size={192} onClose={() => setPreviewIcon(false)}/>}
                    <Grid spacing={2} direction="vertical">
                        <Typography size="1.1rem" lineheight={1}>
                            {mod?.name}
                        </Typography>
                        <Typography size={12} color="$secondaryColor" lineheight={1}>
                            Version {mod?.version}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid margin="8px 0 0" padding={8} direction="vertical" background="$secondaryBackground2" borderRadius={8}>
                    <Typography>
                        Summary
                    </Typography>
                    <Typography size={12} color="$secondaryColor">
                        {mod?.description}
                    </Typography>
                </Grid>
                <Button onClick={() => setShowInfo(false)}>close</Button>
            </Modal>
        }
    </Grid>;
});