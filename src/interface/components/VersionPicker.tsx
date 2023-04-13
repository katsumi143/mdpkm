import { useTranslation } from 'react-i18next';
import React, { useMemo, useEffect, useState } from 'react';
import { Grid, Typography, InputLabel, TypographyProps } from 'voxeliface';

import type { ComponentVersion, ComponentVersions } from '../../../voxura/src/types';
export interface VersionPickerProps {
    id: string
    value: ComponentVersion | null
    versions: ComponentVersions
    onChange: (value: ComponentVersion) => void
	defaultId?: string
}
export default function VersionPicker({ id, value, versions, onChange, defaultId }: VersionPickerProps) {
    const { t } = useTranslation('interface');
	const itemNodes = useMemo<HTMLDivElement[]>(() => [], []);
    const [category, setCategory] = useState(0);
	useEffect(() => onChange(versions[category][0]), [id]);
    useEffect(() => {
        if (!value) {
			const version = (defaultId ? versions.filter(v => v.some(v => v.id === defaultId))[0]?.find(v => v.id === defaultId) : null) ?? versions[category][0];
            onChange(version);

			itemNodes[versions[category].indexOf(version)]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		}
    }, [category]);
	return <Grid width="100%" height="100%" vertical>
		<InputLabel>
			{t(`voxura:component.${id}.versions`)}
		</InputLabel>
		<Grid width="100%" height="100%" smoothing={1} background="$secondaryBackground" borderRadius={16} css={{ overflow: 'hidden' }}>
			{versions.length > 1 && <Grid width="40%" spacing={4} padding={8} vertical css={{
				overflow: 'hidden auto',
				borderRight: '$secondaryBorder2 1px solid'
			}}>
				{versions.map((items, key) =>
					<Grid key={key} padding="4px 12px" onClick={() => setCategory(key)} smoothing={1} borderRadius={8} justifyContent="space-between" css={{
						cursor: 'pointer',
						boxShadow: category === key ? '$buttonShadow' : undefined,
						background: category === key ? '$buttonBackground' : undefined,
						'&:hover': {
							background: '$buttonBackground'
						}
					}}>
						<Typography size={14} noSelect>
							{t(`voxura:component.${id}.release_category.${key}`)}
						</Typography>
						<Typography size={12} color={category === key ? undefined : '$secondaryColor'} family="$secondary" noSelect>
							{t('common.label.items', { count: items.length })}
						</Typography>
					</Grid>
				)}
			</Grid>}
			<Grid width={versions.length > 1 ? '60%' : '100%'} spacing={4} padding={8} vertical css={{
				overflow: 'hidden auto'
			}}>
				{versions[category].map((item, key) =>
					<Grid key={item.id} ref={node => {
						if (node)
							itemNodes[key] = node;
					}} padding="4px 12px" onClick={() => onChange(item)} smoothing={1} borderRadius={8} justifyContent="space-between" css={{
						cursor: 'pointer',
						boxShadow: value === item ? '$buttonShadow' : undefined,
						background: value === item ? '$buttonBackground' : '$secondaryBackground',
						'&:hover': {
							background: '$buttonBackground'
						}
					}}>
						<Typography size={14} noSelect>
							{t(`voxura:component.${id}.release_category.${category}.singular`)} {item.id}
						</Typography>
						{item.dateCreated && <VersionDate date={item.dateCreated} color={value === item ? undefined : '$secondaryColor'}/>}
					</Grid>
				)}
			</Grid>
		</Grid>
	</Grid>;
}

export interface VersionDateProps extends TypographyProps {
	date: Date
}
export function VersionDate({ date, ...props }: VersionDateProps) {
	const { t } = useTranslation('interface');
	const [day, data] = getDayString(date);
	return <Typography size={12} family="$secondary" noSelect {...props}>
		{t(`common.date.${day}`, data as any) as any}
	</Typography>
}

function getDayString(date: Date): [string, number[]?] {
    const difference = Date.now() - date.getTime();
    const days = Math.floor(difference / (1000 * 3600 * 24));
    if (days === 0)
        return ['released_today'];
    if (days === 1)
        return ['released_yesterday'];
    if (days >= 365)
        return ['released_years', [Math.floor(days / 365)]];
    if (days >= 30)
        return ['released_months', [Math.floor(days / 30)]];
    return ['released_days', [Math.floor(days)]];
}