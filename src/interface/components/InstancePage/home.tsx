import { useTranslation } from 'react-i18next';
import React, { ReactNode } from 'react';
import { Grid, Image, Button, Typography, BasicSpinner } from 'voxeliface';

import { getImage } from '../../../util';
import type { Instance } from '../../../../voxura';
export interface InstanceHomeProps {
    setTab: (tab: number) => void,
    instance: Instance
}
export default function InstanceHome({ setTab, instance }: InstanceHomeProps) {
    const { t } = useTranslation('interface');
    const { store } = instance;
	const { gameComponent } = store;
    const componentId = gameComponent.id;
    const refreshContent = () => instance.readMods();
    return <React.Fragment>
        <Grid spacing={8} css={{
            flexWrap: 'wrap'
        }}>
            <Information fill icon={<Image src={getImage('component.' + componentId)} size={32}/>} text={t('voxura:component.' + componentId)} buttons={
                <Button theme="accent" onClick={() => setTab(2)}>
                    {t('common.action.view')}
                    <IconBiCaretRightFill fontSize={11}/>
                </Button>
            }>
                {t('common.label.version', [gameComponent.version])}
            </Information>
            <DateThing icon={<IconBiCalendarPlus/>} title={t('common.label.instance_created')} value={instance.store.dateCreated}/>
            <DateThing icon={<IconBiCalendarHeart/>} title={t('common.label.last_launched')} value={instance.store.dateLaunched}/>
            <Information icon={<IconBiStopwatch/>} text={t('common.label.play_time')}>
                {useTimeString(instance.store.playTime)}
            </Information>
			<Information icon={<IconBiBox2/>} text={t('common.label.content_installed')} buttons={
                <Button theme="accent" onClick={refreshContent} disabled={instance.readingMods}>
                    {instance.readingMods ? <BasicSpinner size={16}/> : <IconBiArrowClockwise/>}
                    {t('common.action.refresh')}
                </Button>
            }>
                {instance.hasReadMods && !instance.readingMods ? `${instance.modifications.length} Modifications` : '(Not available)'}
            </Information>
        </Grid>
    </React.Fragment>
}

function useDayString(date?: number) {
    const { t } = useTranslation('interface');
    if (typeof(date) !== 'number')
        return t('common.date.never');
    
    const difference = Date.now() - date;
    const days = Math.floor(difference / (1000 * 3600 * 24));
    if (days === 0)
        return t('common.date.today');
    if (days === 1)
        return t('common.date.yesterday');
    return t('common.date.days_ago', [days]);
}
function useTimeString(date: number) {
    const { t } = useTranslation('interface');
    if (typeof(date) !== 'number')
        return t('common.date.never');
    
	const hours = Math.round(date / 3600000);
	const minutes = Math.round(date / 60000);
	const seconds = Math.round(date / 1000);
	if (hours > 0)
		return t('common.time.hours', { count: hours });
	else if (minutes > 0)
		return t('common.time.minutes', { count: minutes });
    return t('common.time.seconds', { count: seconds });
}
export interface InformationProps {
    fill?: boolean
	text?: ReactNode
    icon?: ReactNode
    buttons?: ReactNode
    children?: ReactNode
};
function Information({ fill, icon, text, buttons, children }: InformationProps) {
    return <Grid width="100%" padding="12px 16px" spacing={16} smoothing={1} alignItems="center" background="$secondaryBackground2" borderRadius={16} css={{
        flexGrow: 1,
        position: 'relative',
        flexBasis: fill ? null : 'calc(50% - .5rem)'
    }}>
        <Typography noSelect lineheight={1}>{icon}</Typography>
        <Grid spacing={2} vertical>
            <Typography size={14} noSelect lineheight={1}>
                {text}
            </Typography>
            <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" noSelect lineheight={1}>
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
}
export interface DateThingProps {
    icon?: ReactNode
    title: string
    value?: number
}
function DateThing({ icon, title, value }: DateThingProps) {
    return <Information icon={icon} text={title}>
        {useDayString(value)}
    </Information>;
}