import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Button, Typography, DropdownMenu } from 'voxeliface';

import Avatar from '../components/Avatar';
import type { Account } from '../../../voxura';
export interface UserAccountProps {
	active: boolean
    account: Account
}
export function UserAccount({ active, account }: UserAccountProps) {
	const { t } = useTranslation('interface');
	const { secondaryName } = account;
	const refresh = () => account.refresh();
	const select = () => account.setActive();
	const remove = () => account.remove();
	return <Grid width="100%" border={`1px solid $secondaryBorder${active ? 2 : ''}`} padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" cornerRadius={16} css={{
		maxWidth: 512,
		position: 'relative'
	}}>
		<Avatar src={account.avatarUrl} size="sm" circle/>
		<Grid spacing={2} vertical>
			<Typography noSelect lineheight={1}>
				{account.primaryName}
			</Typography>
			{secondaryName && <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
				{secondaryName}
			</Typography>}
		</Grid>
		<Grid spacing={8} alignItems="center" css={{
			right: 16,
			position: 'absolute'
		}}>
			{active ? <Typography size={14} color="$secondaryColor" weight={400} margin="0 8px" family="$secondary" noSelect>
				{t('user_account.selected')}
			</Typography> : <Button theme="accent" onClick={select}>
				{t('common.action.select')}
			</Button>}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<Button theme="secondary"><IconBiThreeDots/></Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<DropdownMenu.Content sideOffset={8}>
						<DropdownMenu.Label>{t('user_account.options.label')}</DropdownMenu.Label>
						<DropdownMenu.Item onClick={refresh}>
							<IconBiArrowClockwise/>
							{t('common.action.refresh')}
						</DropdownMenu.Item>
						<DropdownMenu.Item onClick={remove}>
							<IconBiTrash3/>
							{t('common.action.remove')}
						</DropdownMenu.Item>
						<DropdownMenu.Arrow/>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>
		</Grid>
	</Grid>;
}