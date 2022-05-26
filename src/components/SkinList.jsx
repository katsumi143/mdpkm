import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Archive, CaretRightFill } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';

export default function SkinList({ selected, onSelect }) {
    const { t } = useTranslation();
    const skins = useSelector(state => state.skins.data);
    return <React.Fragment>
        <Grid width="100%" padding=".9rem 1.2rem" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={4} direction="vertical">
                <Typography color="$primaryColor" weight={600} family="Nunito" lineheight={1}>
                    <Archive size={20} style={{ marginRight: 12 }}/>
                    {t('app.mdpkm.home.sidebar.pages.skins')}
                </Typography>
            </Grid>
            <Button theme="secondary">
                {t('app.mdpkm.common:actions.refresh')}
            </Button>
        </Grid>
        <Grid height="100%" margin="8px 0 0" spacing={8} direction="vertical" alignItems="center" css={{
            overflowY: "auto"
        }}>
            {skins.map(skin =>
                <Skin data={skin}/>
            )}
        </Grid>
    </React.Fragment>;
};

function Skin({ data }) {
    const { t } = useTranslation();
    return <Grid width="100%" padding="4px 16px" alignItems="start">
        <Grid width="100%" height="100%" padding={8} spacing={16} alignItems="center" background="$primaryBackground" borderRadius="8px" justifyContent="space-between" css={{
            border: '$secondaryBorder solid 1px',
            position: 'relative'
        }}>
            <Grid width="calc(100% - 80px)" spacing={16} alignItems="center">
                <Image src={`data:image/png;base64,${data.image}`} size={32}/>
                <Grid width="inherit" spacing={4} direction="vertical" alignItems="start">
                    <Typography
                        size="1rem"
                        width="100%"
                        color="$primaryColor"
                        family="Nunito"
                        textalign="start"
                        lineheight={1}
                        whitespace="nowrap"
                        style={{
                            overflow: "hidden"
                        }}
                    >
                        {data.name}
                    </Typography>
                    <Typography
                        size=".8rem"
                        color="$secondaryColor"
                        weight={400}
                        family="Nunito"
                        textalign="start"
                        lineheight={1}
                        whitespace="nowrap"
                    >
                        {null}
                    </Typography>
                </Grid>
            </Grid>
            <Grid css={{
                right: 8,
                position: 'absolute'
            }}>
                <Button theme="secondary">
                    {t('app.mdpkm.common:actions.view')}
                    <CaretRightFill/>
                </Button>
            </Grid>
        </Grid>
    </Grid>;
};