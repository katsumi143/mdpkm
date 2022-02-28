import React from 'react';

import App from '../components/uiblox/App';
import Main from '../components/uiblox/Main';
import Link from '../components/uiblox/Link';
import Header from '../components/uiblox/Header';
import Navigation from '../components/uiblox/Navigation';
import Typography from '../components/uiblox/Typography';

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