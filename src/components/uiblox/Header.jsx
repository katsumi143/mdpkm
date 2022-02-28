import React from 'react';
import { styled } from '@stitches/react';

import Typography from './Typography';
import WindowButtons from './WindowButtons';

const StyledHeader = styled('header', {
    top: 0,
    width: "100%",
    height: 64,
    zIndex: 1100,
    padding: "0 24px",
    position: "sticky",
    backgroundColor: "#121212",

    display: "flex",
    flexWrap: "wrap",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "space-between"
});

const StyledBrand = styled('div', {
    display: "flex"
});

export default class Header extends React.Component {
    render() {
        return (
            <StyledHeader data-tauri-drag-region>
                <StyledBrand>
                    <Typography
                        size="1.5rem"
                        color="#5da545"
                        weight={500}
                        lineheight={2}
                        text="mdpk"
                    />
                    <Typography
                        size="1.5rem"
                        weight={300}
                        lineheight={2}
                        text="m"
                    />
                </StyledBrand>
                <WindowButtons/>
            </StyledHeader>
        );
    }
};