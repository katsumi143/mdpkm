import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ArrowClockwise, CloudArrowDown } from 'react-bootstrap-icons';

import Tabs from '/voxeliface/components/Tabs';
import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Spinner from '/voxeliface/components/Spinner';
import TabItem from '/voxeliface/components/Tabs/Item';
import ModSearch from './ModSearch';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import InstanceMod from './InstanceMod';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';

import Instances from '../common/instances';
export default function ModManagement({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));
    const [tab, setTab] = useState();
    const [items, setItems] = useState(instance.mods);
    const [filter, setFilter] = useState('');
    useEffect(() => {
        if (instance.mods && instance.mods !== items)
            setItems(instance.mods);
        if (!items) {
            setItems('loading');

            const Instance = Instances.getInstance(instanceId);
            Instance.getMods().then(mods => {
                Instance.mods = mods;
                Instance.updateStore();
            });
        }
    }, [items, instance]);
    return <Tabs
        value={tab}
        onChange={event => setTab(event.target.value)}
        borderRadius={0}
        css={{
            height: '100%'
        }}
    >
        <TabItem name={t('app.mdpkm.instance_page.tabs.mods.tabs.manage')} value={0}>
            <Grid margin="4px 0" spacing={8} justifyContent="space-between">
                <Grid direction="vertical">
                    <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                        {t('app.mdpkm.mod_management.title')}
                    </Typography>
                    <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
                        <TextTransition inline>
                            {items === 'loading' || !items ?
                                t('app.mdpkm.common:states.loading') :
                                t('app.mdpkm.mod_management.count', { val: items.length })
                            }
                        </TextTransition>
                    </Typography>
                </Grid>
                <Grid spacing={8}>
                    <TextInput
                        width={144}
                        value={filter}
                        onChange={setFilter}
                        placeholder={t('app.mdpkm.mod_management.search')}
                    />
                    <Button theme="secondary" onClick={() => setItems()} disabled={items === 'loading'}>
                        {items === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                        {t('app.mdpkm.common:actions.refresh')}
                    </Button>
                    <Button theme="accent" disabled>
                        <CloudArrowDown size={14}/>
                        {t('app.mdpkm.mod_management.get_updates')}
                    </Button>
                </Grid>
            </Grid>
            {Array.isArray(items) ? items.length === 0 ?
                <React.Fragment>
                    <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                        There's nothing here!
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={0} css={{ display: 'block' }}>
                        Find some mods via the <b>Mod Search</b> tab!
                    </Typography>
                </React.Fragment>
            : items.filter(({ id, name }) =>
                id?.toLowerCase().includes(filter) ||
                name?.toLowerCase().includes(filter)
            ).sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id)).map((mod, index) =>
                <InstanceMod key={index} mod={mod} instanceId={instanceId}/>
            ) : <Spinner/>}
        </TabItem>
        <TabItem name={t('app.mdpkm.instance_page.tabs.mods.tabs.search')} value={1}>
            <ModSearch instanceId={instanceId}/>
        </TabItem>
    </Tabs>;
};