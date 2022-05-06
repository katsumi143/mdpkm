import React from 'react';
import { keyframes } from '@stitches/react';

import Tag from './Tag';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import LocalStrings from '../localization/strings';

const FadeAnimation = keyframes({
    "0%": {
        opacity: 1,
        transform: "none"
    },
    "100%": {
        opacity: 0,
        transform: "scale(0.8)"
    }
});

export default function SelectInstanceType({ types, loading, backButton, settingUp }) {
    return (
        <Grid padding="2rem 0" spacing="16px" direction="vertical" alignItems="center" css={{
            height: 'fit-content',
            minWidth: '100%',
            pointerEvents: settingUp ? 'none' : 'unset',
            animationName: settingUp ? FadeAnimation : 'none',
            animationDuration: '250ms',
            animationFillMode: 'forwards',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            {backButton}
            <Grid margin="0 0 16px 0" direction="vertical" alignItems="center">
                <Typography size="1.2rem" color="$primaryColor" weight={400} family="Nunito Sans">
                    Adding New Instance
                </Typography>
                <Typography color="$secondaryColor" family="Nunito" weight={600}>
                    Select Instance Type
                </Typography>
            </Grid>
            {types.map((type, index) =>
                typeof type === "string" && type.startsWith("divide") ?
                    <Grid key={index} width="60%" height="2px" margin="8px 0" background="$gray8" borderRadius={1}>
                        <Typography size=".9rem" color="$secondaryColor" weight={600} family="Nunito" css={{
                            top: 0,
                            left: "50%",
                            padding: "0 8px",
                            position: "relative",
                            transform: "translateX(-50%)",
                            background: "$primaryBackground"
                        }}>
                            {type.split(":")[1]}
                        </Typography>
                    </Grid>
                :
                <Grid key={index} width="60%" padding="16px 24px" background="#0000001a" borderRadius="4px" alignItems="center" justifyContent="space-between" css={{
                    overflow: 'hidden'
                }}>
                    <Grid alignItems="center">
                        <Image src={type[1]} size="48px" borderRadius={4}/>
                        <Grid margin="0 0 0 24px" direction="vertical" alignItems="start">
                            <Typography color="$primaryColor" whitespace="nowrap">
                                {LocalStrings[`app.mdpkm.select_instance_type.${type[0]}`]}
                                {type[3] &&
                                    <Tag margin="0 0 0 8px">
                                        <Typography size="0.8rem" color="$tagColor" weight={600} family="Nunito" lineheight={1.2}>
                                            {type[3]}
                                        </Typography>
                                    </Tag>
                                }
                            </Typography>
                            <Typography size="0.8rem" color="$secondaryColor" weight={300} textalign="start" whitespace="pre-wrap">
                                {LocalStrings[`app.mdpkm.select_instance_type.${type[0]}.description`]}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid spacing="8px">
                        {type[2]?.map(([text, onClick, disabled, theme], index) => 
                            <Button key={index} theme={theme} onClick={onClick} disabled={loading || disabled}>
                                {loading && <BasicSpinner size={16}/>}
                                {text}
                            </Button>
                        )}
                    </Grid>
                </Grid>
            )}
        </Grid>
    );
};