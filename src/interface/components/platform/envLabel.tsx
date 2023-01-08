import React from 'react';
import { Typography } from 'voxeliface';
import { useTranslation } from 'react-i18next';
export interface EnvironmentLabelProps {
	client: string
	server: string
}
export default function EnvironmentLabel({ client, server }: EnvironmentLabelProps) {
	const { t } = useTranslation('interface');
	return <Typography size={12} color="$secondaryColor" weight={400} family="$secondary" spacing={4} noSelect lineheight={1}>
		{client === 'optional' && server === 'optional' ? <>
			<IconBiGlobe fontSize={10}/>
			{t('project.side.2')}
		</> : client === 'required' && server === 'required' ? <>
			<IconBiGlobe/>
			{t('project.side.3')}
		</> : (client === 'optional' || client === 'required') && (server === 'optional' || server === 'unsupported') ? <>
			<IconBiDisplay/>
			{t('project.side.0')}
		</> : (server === 'optional' || server === 'required') && (client === 'optional' || client === 'unsupported') ? <>
			<IconBiHdd/>
			{t('project.side.1')}
		</> : <>
			{t('project.side.4')}
		</>}
	</Typography>;
}