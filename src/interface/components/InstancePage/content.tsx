import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import ModManagement from '../ModManagement';
import ResourcePackManagement from '../ResourcePackManagement';
import { Tabs, TabItem } from '../../../../voxeliface';

import type { Instance } from '../../../voxura';
export type ContentProps = {
    instance: Instance
};
export default function Content({ instance }: ContentProps) {
    const { t } = useTranslation();
    const [tab, setTab] = useState(0);
    return <Tabs
        value={tab}
        onChange={(event: any) => setTab(event.target.value)}
        borderRadius={0}
        css={{
            height: '100%',
            border: 'none',
            willChange: 'contents'
        }}
    >
        <TabItem name={t('app.mdpkm.instance_page.tabs.content.tabs.mods')} icon={<IconBiList/>} value={0} padding={0}>
            <ModManagement instanceId={instance.id}/>
        </TabItem>
        <TabItem name={t('app.mdpkm.instance_page.tabs.content.tabs.resource_packs')} icon={<IconBiList/>} value={1}>
            <ResourcePackManagement instanceId={instance.id}/>
        </TabItem>
    </Tabs>
};