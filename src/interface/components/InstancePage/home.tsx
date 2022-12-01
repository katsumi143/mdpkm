import { useTranslation } from 'react-i18next';
import React, { ReactNode } from 'react';

import ImageWrapper from '../ImageWrapper';
import { Grid, Image, Button, Typography, BasicSpinner } from '../../../../voxeliface';

import mdpkm from '../../../mdpkm';
import type { Instance } from '../../../voxura';
import { getImage } from '../../../util';
export type InstanceHomeProps = {
    setTab: (tab: number) => void,
    instance: Instance
};
export default function InstanceHome({ setTab, instance }: InstanceHomeProps) {
    const { t } = useTranslation();
    const { store } = instance;
    const loaderId = store.gameComponent.id;
    const gameVersion = store.gameComponent.version;
    const loaderEntry = mdpkm.getLoaderEntry(loaderId);
    const versionBanner = null;//(loaderEntry?.versionBanners ?? API.getLoader('java')?.versionBanners)?.find(v => v?.[0].test(gameVersion));
    const refreshContent = () => instance.readMods();
    return <React.Fragment>
        <Grid spacing={16} css={{
            flexWrap: 'wrap'
        }}>
            {versionBanner && <Grid width="100%" padding={16} spacing={16} background="$secondaryBackground2" borderRadius={16} justifyContent="space-between" css={{
                border: 'transparent solid 1px',
                background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
            }}>
                <Grid spacing={16}>
                    <ImageWrapper
                        src={versionBanner[1]}
                        size={40}
                        width="8rem"
                        canPreview
                        css={{
                            backgroundPosition: 'left'
                        }}
                    />
                    <Grid spacing={4} direction="vertical" justifyContent="center">
                        <Typography size={14} lineheight={1}>
                            {versionBanner[2]}
                        </Typography>
                        <Typography size={12} color="$secondaryColor" lineheight={1}>
                            {loaderEntry?.displayName} {gameVersion}
                        </Typography>
                    </Grid>
                </Grid>
                <ImageWrapper
                    src={getImage()}
                    size={40}
                    width="8rem"
                    canPreview
                    borderRadius={4}
                    css={{ backgroundPosition: 'right' }}
                />
            </Grid>}
            <Information fill icon={<Image src={getImage('component.' + loaderId)} size={32}/>} text={t('voxura:component.' + loaderId)} buttons={
                <Button theme="accent" onClick={() => setTab(3)}>
                    {t('app.mdpkm.common:actions.view')}
                    <IconBiCaretRightFill fontSize={11}/>
                </Button>
            }>
                {t('interface:common.label.instance_component_count', [instance.store.components.length])}
            </Information>
            <DateThing icon={<IconBiCalendarPlus/>} title={t('interface:common.label.instance_created')} value={instance.store.dateCreated}/>
            <DateThing icon={<IconBiCalendarHeart/>} title={t('interface:common.label.last_launched')} value={instance.store.dateLaunched}/>
            <Information icon={<IconBiBox2/>} text={t('interface:common.label.content_installed')} buttons={
                <Button theme="accent" onClick={refreshContent} disabled={instance.readingMods}>
                    {instance.readingMods ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                    {t('app.mdpkm.common:actions.refresh')}
                </Button>
            }>
                {instance.hasReadMods && !instance.readingMods ? `${instance.modifications.length} mods` : '(Not available)'}
            </Information>
        </Grid>
    </React.Fragment>
};

function useDayString(date?: number) {
    const { t } = useTranslation();
    if (typeof(date) !== 'number')
        return t('interface:common.date.never');
    
    const difference = Date.now() - date;
    const days = Math.floor(difference / (1000 * 3600 * 24));
    if (days === 0)
        return t('interface:common.date.today');
    if (days === 1)
        return t('interface:common.date.yesterday');
    return t('interface:common.date.days_ago', [days]);
};
export type InformationProps = {
    text?: string,
    fill?: boolean,
    icon?: ReactNode,
    buttons?: ReactNode,
    children?: ReactNode
};
function Information({ fill, icon, text, buttons, children }: InformationProps) {
    return <Grid width="100%" padding="12px 16px" spacing={16} alignItems="center" borderRadius={16} css={{
        border: 'transparent solid 1px',
        flexGrow: 1,
        position: 'relative',
        flexBasis: fill ? null : 'calc(50% - .5rem)',
        background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
    }}>
        <Typography lineheight={1}>{icon}</Typography>
        <Grid spacing={2} vertical>
            <Typography size={14} lineheight={1}>
                {text}
            </Typography>
            <Typography size={12} color="$secondaryColor" lineheight={1}>
                {children}
            </Typography>
        </Grid>
        <Grid css={{
            right: 12,
            position: 'absolute'
        }}>
            {buttons}
        </Grid>
    </Grid>;
};
export type DateThingProps = {
    icon?: ReactNode,
    title: string,
    value: number
};
function DateThing({ icon, title, value }: DateThingProps) {
    return <Information icon={icon} text={title}>
        {useDayString(value)}
    </Information>;
};