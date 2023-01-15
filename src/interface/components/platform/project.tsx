import { open } from '@tauri-apps/api/shell';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Button, Spinner, Tooltip, Typography, ContextMenu, BasicSpinner } from 'voxeliface';

import ImageWrapper from '../ImageWrapper';
import EnvironmentLabel from './envLabel';

import { toast } from '../../../util';
import { useDownloads } from '../../../voxura';
import { useAppSelector } from '../../../store/hooks';
import { useStoredValue } from '../../../../voxura/src/storage';
import { CompatibilityError } from '../../../../voxura/src/instance';
import { Project, Platform, Instance, VoxuraStore, DownloadState } from '../../../../voxura';
export interface ProjectProps {
    id?: string
    data?: Project<any>
    featured?: boolean
	platform?: Platform<any>
    instance?: Instance
    recommended?: boolean
}
export default function ProjectComponent({ id, data, featured, platform, instance, recommended }: ProjectProps) {
    const { t } = useTranslation('interface');
	const projects = useStoredValue<VoxuraStore["projects"]>('projects', {});
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const [project, setProject] = useState(data);
    const [loading, setLoading] = useState(!data);
    const installed = instance ? Object.entries(projects).filter(e => instance.modifications.some(m => m.md5 === e[0])).some(e => e[1].id === (id ?? data?.id)) : false;
    const installing = useDownloads().some(d => d.id === 'project' && d.extraData[0] === project?.displayName && !installed);
    const install = () => instance?.installProject(project!).catch(err => {
		if (err instanceof CompatibilityError)
			toast('project_incompatible', [project?.displayName]);
		else
			toast('download_fail', [project?.displayName]);
		throw err;
	});
	const openAuthor = () => open(project!.source.baseUserURL + project!.author)
	const openWebsite = () => open(project!.website);
    useEffect(() => {
        if(id && platform && !project)
			platform.getProject(id).then(project => {
				setProject(project);
				setLoading(false);
			});
    }, [id, project, platform]);
    useEffect(() => {
        if(data && data !== project)
            setProject(data);
    }, [data]);

	if (loading || !project)
		return <Grid padding={8} background="$secondaryBackground2" smoothing={1} borderRadius={16} css={{
			border: 'transparent solid 1px',
			position: 'relative',
			background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
		}}>
			<Spinner/>
			<Grid spacing={2} vertical justifyContent="center">
				<Typography size={14} lineheight={1}>
					{t('app.mdpkm.common:states.loading')}
				</Typography>
				{id && platform &&
					<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
						{t('app.mdpkm.mod.platform', {
							id,
							name: t(`app.mdpkm.common:platforms.${platform.id}`)
						})}
					</Typography>
				}
			</Grid>
		</Grid>

    const iconSize = isCompact ? 32 : 48;
	return <ContextMenu.Root>
		<ContextMenu.Trigger asChild>
			<Grid padding={8} background="$secondaryBackground2" smoothing={1} borderRadius={16} css={{
				border: 'transparent solid 1px',
				position: 'relative',
				background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
			}}>
				<ImageWrapper src={project.webIcon} size={iconSize} smoothing={1} canPreview background="$secondaryBackground" borderRadius={8} css={{
					filter: project.isExplict && 'blur(2px)',
					minWidth: iconSize
				}}/>
				<Grid margin={isCompact ? '4px 0 0 10px' : '4px 0 0 12px'} padding="2px 0" spacing={2} vertical>
					<Grid spacing={4}>
						<Tooltip.Root delayDuration={50}>
							<Tooltip.Trigger asChild>
								<Typography size={isCompact ? 14 : 16} onClick={openWebsite} noSelect lineheight={1} css={{
									cursor: 'pointer'
								}}>
									{project.displayName}
								</Typography>
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content>
									{t('project.visit_site', {project})}
									<Tooltip.Arrow/>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>
						{project.author && <Tooltip.Root delayDuration={50}>
							<Tooltip.Trigger asChild>
								<Typography size={isCompact ? 10 : 12} color="$secondaryColor" family="$secondary" onClick={openAuthor} noSelect lineheight={1} css={{
									cursor: 'pointer',
									'&:hover': { color: '$linkColor' }
								}}>
									{t('project.author', {project})}
								</Typography>
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content>
									{t('project.visit_site', {project})}
									<Tooltip.Arrow/>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>}
						{featured &&
							<Typography size={14} color="#cbc365" noSelect lineheight={1}>
								{t('project.featured')}
							</Typography>
						}
						{recommended &&
							<Typography size={14} color="$secondaryColor" noSelect lineheight={1}>
								{t('project.recommended')}
							</Typography>
						}
						{project.isExplict &&
							<Typography size={14} color="#e18e8e" noSelect lineheight={1}>
								{t('project.explict')}
							</Typography>
						}
					</Grid>
					<Typography size={isCompact ? 12 : 14} color="$secondaryColor" weight={400} family="$secondary" noSelect textalign="left" whitespace="pre-wrap">
						{project.summary}
					</Typography>
					<Grid margin="2px 0 0" spacing={16}>
						<EnvironmentLabel client={project.clientSide} server={project.serverSide}/>
						{project.displayCategories.map(category =>
							<Typography key={category} size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
								{t(`voxura:platform_category.${category}`)}
							</Typography>
						)}
					</Grid>
				</Grid>
				<Grid spacing={8} css={{
					right: 8,
					position: 'absolute'
				}}>
					{project.followers &&
						<Typography size={isCompact ? 11 : 12} color="$secondaryColor" weight={400} family="$secondary" margin="0 8px 0 0" spacing={6} noSelect>
							<IconBiSuitHeartFill fontSize={10}/>
							{t('project.followers', { count: project.followers })}
						</Typography>
					}
					{project.downloads &&
						<Typography size={isCompact ? 11 : 12} color="$secondaryColor" weight={400} family="$secondary" margin="0 8px 0 0" spacing={6} noSelect>
							<IconBiDownload/>
							{t('common.label.downloads', { count: project.downloads })}
						</Typography>
					}
					<Button size={isCompact ? 'smaller' : 'small'} theme="accent" onClick={install} disabled={installing || installed}>
						{installing ?
							<BasicSpinner size={16}/> : <IconBiDownload/>
						}
						{installed ? t('common.label.installed') :
							installing ? t('common.label.installing') : t('common.action.install')
						}
					</Button>
				</Grid>
			</Grid>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.MenuLabel>
				{project.displayName} {t('mod.author', {project})} ({t(`voxura:platform.${project.source.id}`)})
			</ContextMenu.MenuLabel>
			{instance && <ContextMenu.MenuItem onClick={install} disabled={installing || installed}>
				{installing ? <BasicSpinner size={16}/> : <IconBiDownload/>}
				{t('common.action.install')}
			</ContextMenu.MenuItem>}
			<ContextMenu.MenuItem onClick={openWebsite}>
				<IconBiBoxArrowUpRight/>
				{t('common.action.view_website')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator/>
			<ContextMenu.MenuItem onClick={() => writeText(project.id)}>
				<IconBiClipboardPlus/>
				{t('common.action.copy_id')}
			</ContextMenu.MenuItem>
		</ContextMenu.Content>
	</ContextMenu.Root>;
}