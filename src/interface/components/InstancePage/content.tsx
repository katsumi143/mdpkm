import React from 'react';

import ModManagement from '../ModManagement';

import type { Instance } from '../../../voxura';
export type ContentProps = {
    instance: Instance
};
export default function Content({ instance }: ContentProps) {
    return <ModManagement instanceId={instance.id}/>;
};