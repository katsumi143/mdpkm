import React from 'react';
import { styled } from '@stitches/react';

import Grid from './Grid';
import Typography from './Typography';

const StyledCard = styled(Grid, {
    padding: "16px 24px",
    borderRadius: 8,
    backgroundColor: "#181818"
});

export default class Card extends React.Component {
    render() {
        return (
            <StyledCard
                direction="vertical"
                {...this.props}
            >
                <Typography
                    text={this.props.title || "Card Title"}
                    size="1.2rem"
                    color="#ffffffd9"
                    weight={600}
                    margin="0 0 4px 0"
                />
                <Grid>
                    {this.props.children}
                </Grid>
            </StyledCard>
        );
    }
};