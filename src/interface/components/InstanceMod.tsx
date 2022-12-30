import React from 'react';
import { Breakpoint } from 'react-socks';
import { useTranslation } from 'react-i18next';

import ImageWrapper from './ImageWrapper';
import { Link, Grid, Button, Typography } from 'voxeliface';

import type Mod from '../../../voxura/src/util/mod';
import { IMAGES } from '../../util/constants';
import type { Instance } from '../../../voxura';
import { useAppSelector } from '../../store/hooks';
export interface InstanceModProps {
    mod: Mod
    embedded?: boolean
    instance?: Instance
}
export default function InstanceMod({ mod, embedded, instance }: InstanceModProps) {
    const { t } = useTranslation('interface');
	const update = null;
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const deleteMod = () => null;
	const satisfied = instance ? mod.dependencies.every(d => instance.store.components.some(c => d.id.includes(c.id))) : true;
	
    const iconSize = isCompact ? 32 : 40;
    return <Grid vertical>
        <Grid spacing={8} vertical smoothing={1} borderRadius={16} css={{
            border: 'transparent solid 1px',
            position: 'relative',
            background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
        }}>
            <Grid width="100%" spacing={isCompact ? 4 : 8} alignItems="center">
                <ImageWrapper src={mod?.webIcon ?? IMAGES.placeholder} size={iconSize} margin="8px 0 8px 8px" pixelated smoothing={1} canPreview background="$secondaryBackground" borderRadius={8}/>
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
					{!satisfied && <Typography size={12} color="#ffba64" margin="0 16px" noSelect>
						<IconBiExclamationTriangleFill/>
						{t('mod.issue.incompatible')}
					</Typography>}
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
                                {t(`voxura:component.${mod.dependencies[0]?.id}`)}
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
    </Grid>;
}