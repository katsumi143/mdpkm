import React from 'react';
import { styled } from '@stitches/react';

import Grid from '/voxeliface/components/Grid';

const StyledModpackListPage = styled(Grid, {
    top: 0,
    position: "relative",
    minWidth: "100%",
    minHeight: "100%",
    transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
});

export default function ModpackListPage({ page, state, children }) {
    const state2 = page < state ? 0 : page === state ? 1 : 2;
    return (
        <StyledModpackListPage width="100%" height="100%" direction="vertical" css={{
            left: `${[`-${100 * (page + 1)}%`, `${-100 * page}%`, '100%'][state2]}`,
            opacity: `${[0, 1, 0][state2]}`
        }} justifyContent="space-between">
            {children}
        </StyledModpackListPage>
    );
};