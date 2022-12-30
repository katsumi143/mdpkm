import React from 'react';
import { open } from '@tauri-apps/api/shell';
import { Breakpoint } from 'react-socks';
import { useTranslation } from 'react-i18next';

import ImageWrapper from './ImageWrapper';
import { Link, Grid, Button, Tooltip, Typography } from 'voxeliface';

import type Mod from '../../../voxura/src/util/mod';
import { IMAGES } from '../../util/constants';
import type { Instance } from '../../../voxura';
import { useAppSelector } from '../../store/hooks';
export interface InstanceModProps {
    mod: Mod
	instance: Instance
    embedded?: boolean
}
export default function InstanceMod({ mod, embedded, instance }: InstanceModProps) {
    const { t } = useTranslation('interface');
	const update = null;
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
	const satisfied = mod.dependencies.every(d => instance.store.components.some(c => d.id.includes(c.id)));
	
    const iconSize = isCompact ? 32 : 40;
	const removeMod = () => instance.removeMod(mod);
	const openWebsite = () => open(mod.source?.baseProjectURL + mod.id);
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
					{!satisfied && <Tooltip.Root delayDuration={50}>
						<Tooltip.Trigger asChild>
							<Typography size={12} color="#ffba64" margin="0 16px" noSelect>
								<IconBiExclamationTriangleFill/>
								{t('mod.issue.incompatible')}
							</Typography>
						</Tooltip.Trigger>
						<Tooltip.Portal>
							<Tooltip.Content>
								This feature is incomplete.
								<Tooltip.Arrow/>
							</Tooltip.Content>
						</Tooltip.Portal>
					</Tooltip.Root>}
                    <Grid vertical alignItems="end">
						{mod.source && <Tooltip.Root delayDuration={50}>
							<Tooltip.Trigger asChild>
								<Typography size={12} color="$secondaryColor" spacing={6} onClick={openWebsite} noSelect css={{
									cursor: 'pointer',
									'&:hover': {
										color: '$primaryColor'
									}
								}}>
									<IconBiCloudFill/>
									{t(`voxura:platform.${mod.source.id}`)}
								</Typography>
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content>
									{t('mod.visit_site', {mod})}
									<Tooltip.Arrow/>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>}
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
                    {!embedded && <Link size={isCompact ? 11 : 12} padding="0 16px" onClick={removeMod}>
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