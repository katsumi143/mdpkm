import React from 'react';

import App from '/src/components/App';
import Main from '/voxeliface/components/Main';
import Link from '/voxeliface/components/Link';
import Header from '/src/components/Header';
import Navigation from '/voxeliface/components/Navigation';
import Typography from '/voxeliface/components/Typography';

export default class UhOhPage extends React.Component {
    render() {
        return (
            <App>
                <Header text="goggle trans" icon={"/favicon.ico"} />
                <Navigation>
                    <Link to="/" text="Home" icon="bi bi-house-door-fill"/>
                </Navigation>
                <Main>
                    <Typography text="george not found"/>
                </Main>
            </App>
        );
    }
};