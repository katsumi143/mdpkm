import React from 'react';
import { styled } from '@stitches/react';

import Grid from './uiblox/Grid';

const StyledModpackListPage = styled(Grid, {
    top: 0,
    position: "relative",
    minWidth: "100%",
    minHeight: "100%",
    transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
});

export default class ModpackListPage extends React.Component {
    render() {
        const { page, state, children } = this.props;
        const state2 = page < state ? 0 : page === state ? 1 : 2;
        return (
            <StyledModpackListPage width="100%" height="100%" direction="vertical" style={{
                left: `${[`-${100 * (page + 1)}%`, `${-100 * page}%`, '100%'][state2]}`,
                opacity: `${[0, 1, 0][state2]}`
            }} justifyContent="space-between">
                {children}
            </StyledModpackListPage>
        );
    }
};