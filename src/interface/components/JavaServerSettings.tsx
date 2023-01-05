import React from 'react';

import ServerProperties from './ServerProperties';
import type { Instance } from '../../../voxura';
export interface JavaServerSettingsProps {
	instance: Instance
}
export default function JavaServerSettings({ instance }: JavaServerSettingsProps) {
	return <ServerProperties instance={instance}/>;
}