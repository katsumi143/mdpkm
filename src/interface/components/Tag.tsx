import React, { ReactNode } from 'react';

import { Grid } from 'voxeliface';
export type TagProps = {
    css?: Record<string, any>,
    margin?: string | number,
    children?: ReactNode | ReactNode[]
};
export default function Tag({ css, margin, children }: TagProps) {
    return (
        <Grid margin={margin} height="fit-content" spacing={4} padding="1px 8px" alignItems="center" background="$tagBackground" borderRadius={8} css={{
            border: '1px solid $tagBorder',
            ...css
        }}>
            {children}
        </Grid>
    );
};