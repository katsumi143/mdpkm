import { Breakpoint } from 'react-socks';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Modal from './Modal';
import ImagePreview from './ImagePreview';
import { Link, Grid, Image, Button, Typography, TextHeader } from 'voxeliface';

import Patcher from '../../plugins/patcher';
import type Mod from '../../../voxura/src/util/mod';
import { useInstance } from '../../voxura';
import { useAppSelector } from '../../store/hooks';
export type InstanceModProps = {
    mod: Mod,
    updates?: any[],
    embedded?: boolean,
    instanceId?: string
};
export default Patcher.register(function InstanceMod({ mod, embedded, instanceId }: InstanceModProps) {
    const { t } = useTranslation('interface');
	const update = null;
    const instance = useInstance(instanceId ?? '');
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const [showInfo, setShowInfo] = useState(false);
    const [previewIcon, setPreviewIcon] = useState(false);
    const deleteMod = () => null;
    if (!instance)
        throw new Error('could not find instance');

    const iconSize = isCompact ? 32 : 40;
    return <Grid vertical>
        <Grid spacing={8} vertical smoothing={1} background="$secondaryBackground2" borderRadius={16} css={{
            border: 'transparent solid 1px',
            position: 'relative',
            background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
        }}>
            <Grid width="100%" spacing={isCompact ? 4 : 8} onClick={() => setShowInfo(true)} alignItems="center" css={{
                '&:hover': {
                    cursor: 'pointer'
                }
            }}>
                <Image src={mod?.webIcon} size={iconSize} margin="8px 0 8px 8px" smoothing={1} background="$secondaryBackground" borderRadius={8} css={{
                    minWidth: iconSize,
                    minHeight: iconSize,
                    boxShadow: '$buttonShadow',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    imageRendering: 'pixelated'
                }}/>
                <Grid margin="0 0 0 4px" spacing={2} vertical>
                    <Typography size={isCompact ? 14 : 16} weight={400} family="$secondary" noSelect lineheight={1}>
                        {mod.name ?? mod.id}
                    </Typography>
                    <Typography size={isCompact ? 10 : 12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
                        {t('common.label.version', [mod.version])}
                    </Typography>
                </Grid>
                <Grid spacing={8} alignItems="center" css={{
                    right: 0,
                    position: 'absolute'
                }}>
                    <Grid vertical alignItems="end">
                        {mod.source && <Breakpoint customQuery="(min-width: 820px)">
                            <Typography size={12} color="$secondaryColor" spacing={6} noSelect>
                                <IconBiCloudFill/>
                                {t(`voxura:platform.${mod.source.id}`)}
                            </Typography>
                        </Breakpoint>}
                        <Breakpoint customQuery="(min-width: 690px)">
                            {!update && <Typography size={12} color="$secondaryColor" spacing={6} noSelect>
                                <IconBiBoxFill fontSize={10}/>
                                {t(`voxura:component.${mod.loader}`)}
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
                            {t('common.action.delete')}
                        </Breakpoint>
                    </Link>}
                </Grid>
            </Grid>
        </Grid>
        {showInfo &&
            <Modal width="60%" height="50%">
                <TextHeader>Modification Information</TextHeader>
                <Grid padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={8}>
                    <Image src={mod.webIcon} size={48} onClick={() => setPreviewIcon(true)} background="$secondaryBackground" borderRadius={4} css={{
                        cursor: 'zoom-in',
                        boxShadow: '$buttonShadow',
                        imageRendering: 'pixelated'
                    }}/>
                    {previewIcon && <ImagePreview src={mod.webIcon} size={192} onClose={() => setPreviewIcon(false)}/>}
                    <Grid spacing={2} vertical>
                        <Typography lineheight={1}>
                            {mod.name}
                        </Typography>
                        <Typography size={12} color="$secondaryColor" lineheight={1}>
                            Version {mod.version}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid margin="8px 0 0" padding={8} vertical background="$secondaryBackground2" borderRadius={8}>
                    <Typography>
                        Summary
                    </Typography>
                    <Typography size={12} color="$secondaryColor">
                        {mod.description}
                    </Typography>
                </Grid>
                <Button onClick={() => setShowInfo(false)}>close</Button>
            </Modal>
        }
    </Grid>;
});