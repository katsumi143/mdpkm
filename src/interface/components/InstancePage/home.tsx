import { useTranslation } from 'react-i18next';
import React, { ReactNode } from 'react';
import { Grid, Image, Button, Typography } from 'voxeliface';

import type { InstanceStore } from '../../../../voxura';
import { getImage, useDayString, useTimeString } from '../../../util';
export interface InstanceHomeProps {
	store: InstanceStore,
	setTab: (tab: number) => void,
}
export default function InstanceHome({ store, setTab }: InstanceHomeProps) {
	const { t } = useTranslation('interface');
	const { gameComponent } = store;
	const componentId = gameComponent.id;
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
			<DateThing icon={<IconBiCalendarPlus/>} title={t('common.label.instance_created')} value={store.dateCreated}/>
			<DateThing icon={<IconBiCalendarHeart/>} title={t('common.label.last_launched')} value={store.dateLaunched}/>
			<Information icon={<IconBiStopwatch/>} text={t('common.label.play_time')}>
				{useTimeString(store.playTime)}
			</Information>
		</Grid>
	</React.Fragment>
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
			<Typography size={14} weight={450} noSelect lineheight={1}>
				{text}
			</Typography>
			<Typography size={12} color="$secondaryColor" family="$secondary" noSelect lineheight={1}>
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