import { open } from '@tauri-apps/api/shell';
import { writeText } from '@tauri-apps/api/clipboard';
import { Breakpoint } from 'react-socks';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Grid, Button, Tooltip, Typography, ContextMenu } from 'voxeliface';

import Avatar from './Avatar';

import type Mod from '../../../voxura/src/util/mod';
import { IMAGES } from '../../util/constants';
import type { Instance } from '../../../voxura';
export interface InstanceModProps {
    mod: Mod
	instance: Instance
}
export default function InstanceMod({ mod, instance }: InstanceModProps) {
	const icon = useMemo(() => mod.webIcon ?? IMAGES.placeholder, [mod.id]);
    const { t } = useTranslation('interface');
	const satisfied = mod.dependencies.every(d => instance.store.components.some(c => d.id.includes(c.id)));
	
	const update = null;
	const removeMod = () => instance.removeMod(mod);
	const openWebsite = () => open(mod.source?.baseProjectURL + mod.id);
    return <ContextMenu.Root>
		<ContextMenu.Trigger asChild>
			<Grid spacing={8} vertical smoothing={1} borderRadius={16} css={{
				border: 'transparent solid 1px',
				position: 'relative',
				background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
			}}>
				<Grid width="100%" spacing={8} alignItems="center">
					<Avatar src={icon} size="sm" margin="8px 0 8px 8px"/>
					<Grid margin="0 0 0 4px" spacing={2} vertical>
						<Typography weight={400} family="$secondary" noSelect lineheight={1}>
							{mod.name ?? mod.id}
						</Typography>
						<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
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
									{t(`voxura:component.${mod.dependencies[0]?.id[0]}`)}
								</Typography>}
							</Breakpoint>
						</Grid>
						{update && <Button theme="accent" disabled>
							<IconBiCloudArrowDown/>
							Update
						</Button>}
						<Link size={12} padding="0 16px" onClick={removeMod}>
							<IconBiTrash3Fill/>
							<Breakpoint customQuery="(min-width: 580px)">
								{t('common.action.delete')}
							</Breakpoint>
						</Link>
					</Grid>
				</Grid>
			</Grid>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.MenuLabel>
				{mod.name} ({mod.md5})
			</ContextMenu.MenuLabel>
			{mod.source && <ContextMenu.MenuItem onClick={openWebsite}>
				<IconBiBoxArrowUpRight/>
				{t('mod.visit_site', {mod})}
			</ContextMenu.MenuItem>}
			<ContextMenu.MenuItem onClick={removeMod}>
				<IconBiTrash3Fill/>
				{t('common.action.delete')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator/>
			<ContextMenu.MenuItem onClick={() => writeText(mod.path)}>
				<IconBiClipboardPlus/>
				{t('common.action.copy_path')}
			</ContextMenu.MenuItem>
		</ContextMenu.Content>
	</ContextMenu.Root>;
}