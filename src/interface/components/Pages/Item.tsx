import { Grid } from 'voxeliface';
import React, { ReactNode } from 'react';
export interface PageItemProps {
    value: any,
    children: ReactNode
}
export default function PageItem({ children }: PageItemProps) {
    return <Grid width="100%" height="100%">
        {children}
    </Grid>;
}