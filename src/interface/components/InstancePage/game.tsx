import { TabItem } from 'voxeliface';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Tabs from '../Tabs';
import Loader from './loader';

import type { Instance } from '../../../../voxura';
import { ComponentExtra, COMPONENT_EXTRAS } from '../../../mdpkm';
export interface GameProps {
    instance: Instance
}
export default function Game({ instance }: GameProps) {
    const { t } = useTranslation('interface');
    const [tab, setTab] = useState(0);

	const extras: [ComponentExtra, string][] = instance.store.components.map(c => [COMPONENT_EXTRAS[c.id], c.id]);
    return <Tabs value={tab} onChange={setTab} css={{ height: '100%' }}>
		<TabItem name={t('instance_page.tab.game.tab.0')} icon={<IconBiApp/>} value={0} padding={0}>
			<Loader instance={instance}/>
        </TabItem>
		{extras.map(extra => extra[0]?.settingsTabs?.map((SettingsTab, key) =>
			<TabItem key={key} name={t(`voxura:component.${extra[1]}.settings_tab.${key}`)} icon={<IconBiList fontSize={11}/>} value={10 + key}>
				<SettingsTab instance={instance}/>
			</TabItem>
		)).flat().filter(x => x)}
    </Tabs>
}