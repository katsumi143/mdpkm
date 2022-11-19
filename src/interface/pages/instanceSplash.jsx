import React, { useState, useEffect } from 'react';
import { once, listen } from '@tauri-apps/api/event';

import App from '/src/components/App';
import Main from '/voxeliface/components/Main';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Spinner from '/voxeliface/components/Spinner';
import Typography from '/voxeliface/components/Typography';

import Patcher from '../../plugins/patcher';

let sent = 1;
export default Patcher.register(function InstanceSplash() {
    const [name, setName] = useState();
    const [text, setText] = useState('Waiting');
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if(!loaded) {
            setLoaded(true);
            listen("name", ({ payload }) => setName(payload));
            listen("text", ({ payload }) => setText(payload));
        }
        once(`text_${sent}`, ({ payload }) => {
            sent += 1;
            this.setState(payload);
        });
    });
    return (
        <App css={{
            border: '$secondaryBorder2 solid 1px'
        }}>
            <Main css={{
                padding: '1.5rem 0px',
                overflow: 'hidden',
                maxHeight: 'unset',
                alignItems: 'center',

                '& *': {
                    userSelect: 'none'
                }
            }}>
                <Image
                    src="img/banners/brand_text.svg"
                    width="100%"
                    height="3rem"
                />
                <Typography
                    size="1.1rem"
                    margin=".6rem 0 0"
                    family="$primaryFontSans"
                >
                    Launching Instance
                </Typography>
                <Typography
                    size=".9rem"
                    color="$secondaryColor"
                    weight={400}
                >
                    {name ?? "Unknown"}
                </Typography>
                <Grid spacing="12px" css={{
                    left: 12,
                    bottom: 12,
                    position: "absolute"
                }}>
                    <Spinner size={24}/>
                    <Typography size=".9rem" color="$secondaryColor" weight={400}>
                        {text}
                    </Typography>
                </Grid>
            </Main>
        </App>
    );
});