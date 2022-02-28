import React from 'react';
import { styled } from '@stitches/react';
import { window } from '@tauri-apps/api';
import { XLg, Fullscreen, FullscreenExit } from 'react-bootstrap-icons';

import Grid from './Grid';

const StyledWindowButtons = styled(Grid, {
    height: "100%"
});

const WindowButtonComponent = styled('button', {
    color: "#cccbcb",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontSize: "1rem",
    background: "none",
    transition: "color 0.2s",

    "&:hover": {
        color: "#fff"
    }
});

export default class WindowButtons extends React.Component {
    closeWindow() {
        window.getCurrent().close();
    }

    async maximizeWindow() {
        const win = window.getCurrent();
        if (await win.isMaximized())
            win.unmaximize();
        else
            win.maximize();
    }

    minimizeWindow() {
        window.getCurrent().minimize();
    }

    render() {
        return (
            <StyledWindowButtons spacing="16px" direction="horizontalReverse" alignItems="center">
                <WindowButtonComponent color="#ff7070" onClick={this.closeWindow.bind(this)} style={{
                    "&:hover": {
                        color: "#ff7070"
                    }
                }}>
                    <XLg/>
                </WindowButtonComponent>
                <WindowButtonComponent onClick={this.maximizeWindow.bind(this)}>
                    <Fullscreen/>
                </WindowButtonComponent>
                <WindowButtonComponent onClick={this.minimizeWindow.bind(this)}>
                    <FullscreenExit/>
                </WindowButtonComponent>
            </StyledWindowButtons>
        );
    }
};