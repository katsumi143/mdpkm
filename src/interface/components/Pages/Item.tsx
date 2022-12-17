import React, { ReactNode } from 'react';

import { Grid } from 'voxeliface';
export type PageItemProps = {
    value: any,
    children: ReactNode
};
export default function PageItem({ children }: PageItemProps) {
    return <Grid width="100%" height="100%">
        {children}
    </Grid>;
};