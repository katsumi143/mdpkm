import React from 'react';
import { keyframes } from '@stitches/react';
import { ArrowLeft } from 'react-bootstrap-icons';

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

export default function SelectInstanceType({ back, types, loading }) {
    return (
        <Grid width="100%" direction="vertical" alignItems="center">
            <Grid width="100%" padding="1rem 0" spacing={4} direction="vertical" alignItems="center" css={{
                borderBottom: '1px solid $tagBorder'
            }}>
                <Typography size="1.4rem" color="$primaryColor" family="Raleway">
                    Adding New Instance
                </Typography>
                <Typography color="$secondaryColor" family="Nunito">
                    Select Instance Type
                </Typography>
            </Grid>
            <Grid width="100%" height="-webkit-fill-available" spacing="1rem" padding="1rem 0" direction="vertical" alignItems="center" css={{
                overflow: 'auto'
            }}>
                {types.map((type, index) =>
                    typeof type === "string" && type.startsWith("divide") ?
                        <Grid key={index} width="70%" height="2px" margin="8px 0" background="$gray8" borderRadius={1}>
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
                    <Grid key={index} width="70%" padding="16px 24px" background="#0000001a" borderRadius="4px" alignItems="center" justifyContent="space-between">
                        <Grid alignItems="center">
                            <Image src={type[1]} size="48px" borderRadius={4}/>
                            <Grid margin="0 0 0 24px" direction="vertical" alignItems="start">
                                <Typography color="$primaryColor" whitespace="nowrap">
                                    {LocalStrings[`app.mdpkm.select_instance_type.${type[0]}`] ?? 'Unknown Name'}
                                    {type[3] &&
                                        <Tag margin="0 0 0 8px">
                                            <Typography size="0.8rem" color="$tagColor" weight={600} family="Nunito" lineheight={1.2}>
                                                {type[3]}
                                            </Typography>
                                        </Tag>
                                    }
                                </Typography>
                                <Typography size="0.8rem" color="$secondaryColor" weight={300} textalign="start" whitespace="pre-wrap">
                                    {LocalStrings[`app.mdpkm.select_instance_type.${type[0]}.description`] ?? 'Unknown Description'}
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
            <Grid width="100%" padding={16} justifyContent="space-between" css={{
                borderTop: '1px solid $tagBorder'
            }}>
                <Button theme="secondary" onClick={back} disabled={loading}>
                    <ArrowLeft size={14}/>
                    Back to Instances
                </Button>
            </Grid>
        </Grid>
    );
};