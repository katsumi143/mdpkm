import React from 'react';

import Typography from '/voxeliface/components/Typography';
import DefaultHeader from '/voxeliface/components/Header/Tauri';

export default function Header(props) {
    return (
        <DefaultHeader brand={<>
            {props.text ??
                <React.Fragment>
                    <Typography
                        text="mdpk"
                        size="1.5rem"
                        color="#5da545"
                        weight={500}
                        lineheight={2}
                    />
                    <Typography
                        text="m"
                        size="1.5rem"
                        margin="0 0 0 -8px"
                        weight={300}
                        lineheight={2}
                    />
                </React.Fragment>
            }
        </>} {...props}/>
    );
};