import React from 'react';
import { Tabs, TabsProps } from 'voxeliface';
export default function StyledTabs(props: TabsProps) {
	return <Tabs {...props} css={{
		gap: 8,
		border: 'none',
		'& > *:first-child': {
			gap: 0,
			border: 'none',
			padding: 0,
			overflow: 'hidden',
			'--squircle-smooth': 1,
			'--squircle-radius': 16,
			'-webkit-mask-image': 'paint(squircle)',
			'& > button': {
				padding: '12px 16px',
				boxShadow: 'none',
				borderRadius: 0
			},
			'& > div:not(:last-child)': { display: 'none' },
			'& > *:last-child': {
				height: 4,
				borderRadius: 0
			}
		},
		'& > *:last-child': {
			background: 'none',
			'& > * > *': { padding: 0 }
		},
		...props.css
	}}/>;
};