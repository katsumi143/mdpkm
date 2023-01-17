import React from 'react';
import { open } from '@tauri-apps/api/shell';
import { appWindow } from '@tauri-apps/api/window';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import { Grid, Image, Button, Typography, TextHeader, BasicSpinner, DropdownMenu } from 'voxeliface';

import Avatar from '../components/Avatar';

import { i, toast } from '../../util';
import { Account, AvatarType } from '../../../voxura';
import voxura, { useAccounts, useCurrentAccount } from '../../voxura';
export default function Accounts() {
    const { t } = useTranslation('interface');
    const current = useCurrentAccount();
    const accounts = useAccounts();
    const changeAccount = (account: Account) => voxura.auth.selectAccount(account);
    const deleteAccount = async(account: Account) => {
        await account.remove();
		toast('account_removed', [account.name]);
    }
    const addNewAccount = () => {
		toast('auth_check_browser');
		voxura.auth.requestMicrosoftAccessCode(true).then(code => {
			appWindow.setFocus();
			return voxura.auth.login(code).then(account => toast('auth_success', [account.name]));
		}).catch(err => {
			toast('unknown_error');
			throw err;
		})
    };
    return <Grid height="100%" padding=".75rem 1rem" vertical css={{
        overflow: 'auto'
    }}>
        <TextHeader noSelect>{t('accounts.header')}</TextHeader>
        <Grid spacing={8} padding="0 1rem" vertical>
            <Image src={i('auth_platform.microsoft')} width={112} height={24} margin="0 0 8px"/>
            {!current && <Typography size={14} color="$secondaryColor" noSelect whitespace="pre">
                {t('accounts.select_account')}
            </Typography>}
            <Grid spacing={8} vertical>
                {accounts.map((account, key) =>
                    <UserAccount key={key} account={account} current={current} changeAccount={changeAccount} deleteAccount={deleteAccount}/>
                )}
            </Grid>
            <Button theme="accent" onClick={addNewAccount}>
                <IconBiPlusLg/>
                {t('accounts.action.add')}
            </Button>
        </Grid>
    </Grid>;
}

// TODO: move into a separate file
export interface UserAccountProps {
    account: Account
    current?: Account
    changeAccount: (account: Account) => void
    deleteAccount: (account: Account) => void
}
export function UserAccount({ account, current, changeAccount, deleteAccount }: UserAccountProps) {
    const { t } = useTranslation('interface');
    const isCurrent = account === current;
    const avatarUrl = account.getAvatarUrl(AvatarType.Xbox);
    const copyUUID = () => {
        if (!account.uuid)
            return toast('unknown_error');
        writeText(account.uuid).then(() =>
			toast('copied_id')
		);
    };
    return <Grid width="50%" border={`1px solid $secondaryBorder${isCurrent ? 2 : ''}`} padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={16} css={{
        position: 'relative'
    }}>
        <Avatar src={avatarUrl} size="sm" circle/>
        <Grid spacing={2} vertical>
			<Typography noSelect lineheight={1}>
				{account.xboxName}
			</Typography>
			<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
                {account.name}
            </Typography>
		</Grid>
        <Grid spacing={8} alignItems="center" css={{
            right: 16,
            position: 'absolute'
        }}>
            {isCurrent ? <Typography size={14} color="$secondaryColor" weight={400} margin="0 8px" family="$secondary" noSelect>
				{t('user_account.selected')}
			</Typography> : <Button theme="accent" onClick={() => changeAccount(account)}>
                {t('common.action.select')}
            </Button>}
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <Button theme="secondary">
                        <IconBiThreeDots/>
                    </Button>
                </DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<DropdownMenu.Content sideOffset={8}>
						<DropdownMenu.Label>{t('user_account.options.label')}</DropdownMenu.Label>
						<DropdownMenu.Item onClick={() => open(`https://namemc.com/profile/${account.uuid}`)}>
							{t('user_account.options.view_namemc')}
							<IconBiBoxArrowUpRight/>
						</DropdownMenu.Item>
						<DropdownMenu.Seperator/>
						<DropdownMenu.Item onClick={() => deleteAccount(account)}>
							<IconBiTrash3/>
							{t('common.action.remove')}
						</DropdownMenu.Item>
						<DropdownMenu.Seperator/>
						<DropdownMenu.Item onClick={copyUUID}>
							<IconBiClipboardPlus/>
							{t('common.action.copy_id')}
						</DropdownMenu.Item>
						<DropdownMenu.Arrow/>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
            </DropdownMenu.Root>
        </Grid>
    </Grid>;
}