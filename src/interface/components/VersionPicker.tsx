import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';

import { Grid, Typography, TypographyProps } from 'voxeliface';

import type { ComponentVersion, ComponentVersions } from '../../../voxura/src/types';
export type VersionPickerProps = {
    id: string,
    value: ComponentVersion | null,
    versions: ComponentVersions,
    onChange: (value: ComponentVersion) => void
};
export default function VersionPicker({ id, value, versions, onChange }: VersionPickerProps) {
    const { t } = useTranslation('interface');
    const [category, setCategory] = useState(0);
    useEffect(() => {
        if (!value)
            onChange(versions[category][0]);
    }, [category]);
    return <Grid width="100%" height="100%" border="$secondaryBorder2 1px solid" borderRadius={16}>
        {versions.length > 1 && <Grid width="40%" spacing={4} padding={8} vertical css={{
            borderRight: '$secondaryBorder2 1px solid'
        }}>
            <Typography size={20} height="fit-content" margin="4px 0 12px 4px" noSelect>
                Version Categories
            </Typography>
            {versions.map((items, key) =>
                <Grid key={key} padding="4px 12px" onClick={() => setCategory(key)} smoothing={1} borderRadius={8} justifyContent="space-between" css={{
                    cursor: 'pointer',
                    boxShadow: category === key ? '$buttonShadow' : undefined,
                    background: category === key ? '$buttonBackground' : '$secondaryBackground',
                    '&:hover': {
                        background: '$buttonBackground'
                    }
                }}>
                    <Typography size={14} noSelect>
                        {t(`voxura:component.${id}.release_category.${key}`)}
                    </Typography>
                    <Typography size={12} color={category === key ? undefined : '$secondaryColor'} family="$secondary" noSelect>
                        {t('common.label.item_count', [items.length])}
                    </Typography>
                </Grid>
            )}
        </Grid>}
        <Grid width={versions.length > 1 ? '60%' : '100%'} spacing={4} padding={8} vertical>
            <Typography size={20} height="fit-content" margin="4px 0 12px 4px" noSelect>
                {t(`voxura:component.${id}.versions`)}
            </Typography>
            <Grid spacing={4} vertical borderRadius={8} css={{ overflow: 'auto' }}>
                {versions[category].map((item, key) =>
                    <Grid key={key} padding="4px 12px" onClick={() => onChange(item)} smoothing={1} borderRadius={8} justifyContent="space-between" css={{
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
};

export type VersionDateProps = TypographyProps & {
	date: Date
}
function VersionDate({ date, ...props }: VersionDateProps) {
	const { t } = useTranslation('interface');
	const [day, data] = getDayString(date);
	return <Typography size={12} family="$secondary" noSelect {...props}>
		{t(`common.date.${day}`, data)}
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
};