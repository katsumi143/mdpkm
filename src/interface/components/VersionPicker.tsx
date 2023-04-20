import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Image, Typography, DropdownMenu, BasicSpinner, TypographyProps } from 'voxeliface';

import { COMPONENT_MAP } from '../../../voxura';
import { i, prettifySemver } from '../../util';
import { useComponentVersions } from '../../voxura';
import type { ComponentVersion } from '../../../voxura/src/types';
export interface VersionPickerProps {
    value?: ComponentVersion
    onChange: (value?: ComponentVersion) => void
	defaultId?: string
	componentId: string
}
export default function VersionPicker({ value, onChange, defaultId, componentId }: VersionPickerProps) {
    const { t } = useTranslation('interface');
	const versions = useComponentVersions(COMPONENT_MAP.find(c => c.id === componentId) as any);
	useEffect(() => {
		if (versions)
			onChange(defaultId ? versions.flat().find(v => v.id === defaultId) : versions[0][0] ?? versions[0][0]);
		else if (value)
			onChange(undefined);
	}, [versions]);
	return <DropdownMenu.Root>
		<DropdownMenu.Trigger asChild>
			<StyledTrigger disabled={!versions}>
				{versions ? <Image src={i(`component.${componentId}`)} size={16}/> : <BasicSpinner size={16}/>}
				{value ? `${t([`voxura:component.${componentId}.versions.category.${value.category}.singular`, 'common.label.version3'])} ${prettifySemver(value.id, t)}` : t('common.label.loading')}
				<IconBiChevronDown/>
			</StyledTrigger>
		</DropdownMenu.Trigger>
		{versions && <DropdownMenu.Portal>
			<DropdownMenu.Content side="right" sideOffset={8} style={{ zIndex: 1000 }}>
				<DropdownMenu.Label>{t([`voxura:component.${componentId}.versions`, 'common.label.versions'])}</DropdownMenu.Label>
				{versions.map((versions, key) => <DropdownMenu.Sub key={`category.${key}`}>
					<DropdownMenu.SubTrigger>
						{t(`voxura:component.${componentId}.versions.category.${key}`)}
						<IconBiCaretRightFill fontSize={14} style={{ margin: '0 0 0 auto' }}/>
					</DropdownMenu.SubTrigger>
					<DropdownMenu.Portal>
						<DropdownMenu.SubContent alignOffset={-33} style={{ zIndex: 1000, overflow: 'auto', maxHeight: 256 }}>
							<DropdownMenu.Label>{t(`voxura:component.${componentId}.versions.category.${key}`)}</DropdownMenu.Label>
							{versions.map((version, key) => <VersionItem
								key={`${version.id}-${key}`}
								version={version}
								onClick={onChange}
								isSelected={value === version}
							/>)}
						</DropdownMenu.SubContent>
					</DropdownMenu.Portal>
				</DropdownMenu.Sub>)}
				<DropdownMenu.Arrow/>
			</DropdownMenu.Content>
		</DropdownMenu.Portal>}
	</DropdownMenu.Root>;
}

export interface VersionItemProps {
	version: ComponentVersion
	onClick: (version: ComponentVersion) => void
	isSelected: boolean
}
export function VersionItem({ version, onClick, isSelected }: VersionItemProps) {
	const { t } = useTranslation('interface');
	return <DropdownMenu.Item key={version.id} onClick={() => onClick(version)}>
		{prettifySemver(version.id, t)}
		{isSelected && <StyledItemIndicator>
			<IconBiCheckLg/>
		</StyledItemIndicator>}
	</DropdownMenu.Item>;
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