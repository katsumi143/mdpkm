import React from 'react';
import * as tauri from '@tauri-apps/api';
import { styled } from '@stitches/react';

import App from '../components/uiblox/App';
import Main from '../components/uiblox/Main';
import Grid from '../components/uiblox/Grid';
import Spinner from '../components/uiblox/Spinner';
import Typography from '../components/uiblox/Typography';

const StyledBrand = styled('div', {
    margin: "1rem 0 0 0",
    display: "flex",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "space-between"
});

let sent = 1;
export default class InstanceSplash extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: null,
            text: "Waiting...",
            loaded: false
        };
    }

    render() {
        return (
            <App>
                <Main style={{
                    overflow: "hidden"
                }}>
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
                    <Typography
                        size="1.1rem"
                        margin=".6rem 0 0 0"
                        weight={400}
                        family="Nunito, sans-serif"
                    >
                        Launching Instance
                    </Typography>
                    <Typography
                        size=".9rem"
                        color="#ffffffb3"
                    >
                        {this.state.name ?? "Unknown"}
                    </Typography>
                    <Grid spacing="12px" style={{
                        left: 12,
                        bottom: 12,
                        position: "absolute"
                    }}>
                        <Spinner size={32}/>
                        <Typography color="#ffffffbf" family="Nunito, sans-serif">
                            {this.state.text}
                        </Typography>
                    </Grid>
                </Main>
            </App>
        );
    }

    componentDidMount() {
        console.log('mounted', this.state);
        if(!this.state.loaded) {
            console.log('loading and stuff');
            const window = tauri.window.getCurrent();
            tauri.event.listen("name", ({ payload }) => this.setState({ name: payload }));
            tauri.event.listen("text", ({ payload }) => this.setState({ text: payload }));

            this.setState({
                //loaded: true
            });
        }
    }

    componentDidUpdate() {
        tauri.event.once(`text_${sent}`, ({ payload }) => {
            console.log(payload);
            sent += 1;
            this.setState({ text: payload });
        });
    }
};