import React from 'react';

import Grid from '/voxeliface/components/Grid';
export default function Tag({ margin, children, css }) {
    return (
        <Grid margin={margin} height="fit-content" spacing={4} padding="1px 8px" alignItems="center" background="$tagBackground" borderRadius={8} css={{
            border: '1px solid $tagBorder',
            ...css
        }}>
            {children}
        </Grid>
    );
};