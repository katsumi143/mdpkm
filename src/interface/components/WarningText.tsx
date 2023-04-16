import React from 'react';
import { Typography } from 'voxeliface';
export interface WarningTextProps {
	text: string
	margin?: string | number
}
export default function WarningText({ text, margin = '8px 16px' }: WarningTextProps) {
	return <Typography size={12} color="#ffba64" height="fit-content" margin={margin} noSelect>
		<IconBiExclamationTriangleFill/>
		{text}
	</Typography>;
}