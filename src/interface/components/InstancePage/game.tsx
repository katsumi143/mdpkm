import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Tabs from '../Tabs';
import Loader from './loader';
import { TabItem } from 'voxeliface';
import ServerManagement from '../ServerManagement';
import ResourcePackManagement from '../ResourcePackManagement';

import type { Instance } from '../../../voxura';
export type GameProps = {
    instance: Instance
};
export default function Game({ instance }: GameProps) {
    const { t } = useTranslation('interface');
    const [tab, setTab] = useState(0);
    return <Tabs value={tab} onChange={setTab} css={{ height: '100%' }}>
		<TabItem name={t('instance_page.tab.game.tab.0')} icon={<IconBiApp/>} value={0} padding={0}>
			<Loader instance={instance}/>
        </TabItem>
        <TabItem name={t('common.pages.servers')} icon={<IconBiList/>} value={1} padding={0}>
            <ServerManagement instanceId={instance.id}/>
        </TabItem>
        <TabItem name={t('common.pages.resource_packs')} icon={<IconBiList/>} value={2}>
            <ResourcePackManagement instanceId={instance.id}/>
        </TabItem>
    </Tabs>
};