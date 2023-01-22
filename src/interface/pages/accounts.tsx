import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Image, Button, TextHeader } from 'voxeliface';

import { i } from '../../util';
import { UserAccount } from '../components/UserAccount';
import { useAppSelector } from '../../store/hooks';
import type { AuthProvider } from '../../../voxura';
import voxura, { useAccounts, useActiveAccount } from '../../voxura';
export default function Accounts() {
    const { t } = useTranslation('interface');
	const showHidden = useAppSelector(state => state.settings.developer.showHiddenAuthProviders);
    return <Grid height="100%" padding=".75rem 1rem" vertical css={{
        overflow: 'auto'
    }}>
        <TextHeader noSelect>{t('accounts.header')}</TextHeader>
        {voxura.auth.providers.filter(p => !p.hidden || showHidden).map(p => <Provider key={p.id} provider={p}/>)}
    </Grid>;
}

export interface ProviderProps {
	provider: AuthProvider<any>
}
export function Provider({ provider }: ProviderProps) {
	const { t } = useTranslation('interface');
	const current = useActiveAccount(provider);
	const accounts = useAccounts(provider);
    const addNewAccount = () => provider.addAccount();
	return <Grid spacing={8} padding="0 1rem 2rem" vertical>
		<Image src={i(`auth_provider.${provider.id}`)} width={112} height={24} margin="0 0 8px"/>
		<Grid spacing={8} vertical>
			{accounts.map((account, key) =>
				<UserAccount key={key} active={account === current} account={account}/>
			)}
		</Grid>
		<Button theme="accent" onClick={addNewAccount}>
			<IconBiPlusLg/>
			{t('accounts.action.add', [provider.id])}
		</Button>
	</Grid>;
}