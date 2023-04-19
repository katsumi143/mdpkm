import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useEffect, useState } from 'react';
import { Grid, Image, Button, Typography, InputLabel, DropdownMenu, BasicSpinner, TypographyProps } from 'voxeliface';

import { i } from '../../util';
import { COMPONENT_MAP } from '../../../voxura';
import { useComponentVersions } from '../../voxura';
import type { ComponentVersion, ComponentVersions } from '../../../voxura/src/types';
export interface VersionPickerProps {
    value: ComponentVersion | null
    onChange: (value: ComponentVersion) => void
	componentId: string
}
export default function VersionPicker({ value, onChange, componentId }: VersionPickerProps) {
    const { t } = useTranslation('interface');
	const versions = useComponentVersions(COMPONENT_MAP.find(c => c.id === componentId) as any);
	useEffect(() => {
		if (versions && !value)
			onChange(versions[0][0]);
	}, [versions]);
	return <DropdownMenu.Root>
		<DropdownMenu.Trigger asChild>
			<StyledTrigger disabled={!versions}>
				{versions ? <Image src={i(`component.${componentId}`)} size={16}/> : <BasicSpinner size={16}/>}
				{value ? `${t([`voxura:component.${componentId}.versions.category.${value.category}.singular`, 'common.label.version3'])} ${value.id}` : t('common.label.loading')}
				<IconBiChevronDown/>
			</StyledTrigger>
		</DropdownMenu.Trigger>
		{versions && <DropdownMenu.Portal>
			<DropdownMenu.Content side="right" sideOffset={8} style={{ zIndex: 1000 }}>
				<DropdownMenu.Label>{t(`voxura:component.${componentId}.versions`)}</DropdownMenu.Label>
				{versions.map((versions, key) => <DropdownMenu.Sub key={`category.${key}`}>
					<DropdownMenu.SubTrigger>
						{t(`voxura:component.${componentId}.versions.category.${key}`)}
						<IconBiCaretRightFill fontSize={14} style={{ margin: '0 0 0 auto' }}/>
					</DropdownMenu.SubTrigger>
					<DropdownMenu.Portal>
						<DropdownMenu.SubContent alignOffset={-33} style={{ zIndex: 1000, overflow: 'auto', maxHeight: 256 }}>
							<DropdownMenu.Label>{t(`voxura:component.${componentId}.versions.category.${key}`)}</DropdownMenu.Label>
							{versions.map(version => <DropdownMenu.Item key={version.id} onClick={() => onChange(version)}>
								{version.id}
								{value === version && <StyledItemIndicator>
									<IconBiCheckLg/>
								</StyledItemIndicator>}
							</DropdownMenu.Item>)}
						</DropdownMenu.SubContent>
					</DropdownMenu.Portal>
				</DropdownMenu.Sub>)}
				<DropdownMenu.Arrow/>
			</DropdownMenu.Content>
		</DropdownMenu.Portal>}
	</DropdownMenu.Root>;
}

const StyledTrigger = styled('button', {
	all: 'unset',
	gap: 8,
	width: 'fit-content',
	color: '$primaryColor',
	height: 32,
	border: '1px solid $secondaryBorder',
	display: 'inline-flex',
	padding: '0 16px',
	minWidth: 196,
	fontSize: 12,
	boxSizing: 'border-box',
	fontWeight: 450,
	userSelect: 'none',
	fontFamily: '$primary',
	alignItems: 'center',
	background: '$primaryBackground',
	transition: 'border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
	borderRadius: 4,

	'& svg': {
		marginLeft: 'auto'
	},
	'&:not(:disabled):hover, &:not(:disabled):focus': {
		borderColor: '$secondaryBorder2'
	},
	'&:disabled': {
		color: '$secondaryColor',
		cursor: 'not-allowed'
	}
});
const StyledItemIndicator = styled('div', {
	right: 8,
	display: 'inline-flex',
	position: 'absolute'
});

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