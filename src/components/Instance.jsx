import React from 'react';
import { keyframes } from '@stitches/react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretRightFill } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import InstanceIcon from './InstanceIcon';

import Patcher from '/src/common/plugins/patcher';
const Animation = keyframes({
    '0%': {
        opacity: 0,
        transform: 'scale(.9) translateY(8px)'
    },
    '100%': {
        opacity: 1,
        transform: 'none'
    }
});

export default Patcher.register(function Instance({ css, data: instance, onView }) {
    const { t } = useTranslation();
    const uiStyle = useSelector(state => state.settings.uiStyle);
    return (
        <Grid width="100%" padding="4px 16px" alignItems="start" css={{
            opacity: 0,
            animation: `${Animation} 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
            animationFillMode: 'forwards',
            ...css
        }}>
            <Grid width="100%" height="100%" padding="8px" spacing="16px" alignItems="center" background="$primaryBackground" borderRadius="8px" justifyContent="space-between" css={{
                border: '$secondaryBorder solid 1px',
                position: 'relative'
            }}>
                <Grid width="calc(100% - 80px)" spacing={uiStyle === 'compact' ? '.6rem' : '1rem'} alignItems="center">
                    <InstanceIcon size={uiStyle === 'compact' ? 36 : 48} instance={instance} hideLoader={uiStyle === 'compact'}/>
                    <Grid width="inherit" spacing={uiStyle === 'compact' ? 2 : 4} direction="vertical" alignItems="start">
                        <Typography
                            size={uiStyle === 'compact' ? '.85rem' : '1rem'}
                            width="100%"
                            color="$primaryColor"
                            family="Nunito"
                            weight={uiStyle === 'compact' ? 400 : 500}
                            textalign="start"
                            lineheight={1}
                            whitespace="nowrap"
                            style={{
                                overflow: "hidden"
                            }}
                        >
                            {instance.name}
                        </Typography>
                        <Typography
                            size={uiStyle === 'compact' ? '.65rem' : '.8rem'}
                            color="$secondaryColor"
                            family="Nunito"
                            weight={uiStyle === 'compact' ? 300 : 400}
                            textalign="start"
                            lineheight={1}
                            whitespace="nowrap"
                        >
                            {instance.state ?? t('app.mdpkm.instances:states.none')}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid css={{
                    right: 8,
                    position: 'absolute'
                }}>
                    <Button size={uiStyle === 'compact' ? 'smaller' : 'small'} theme="secondary" onClick={onView} disabled={instance.corrupt}>
                        {t('app.mdpkm.common:actions.view')}
                        <CaretRightFill/>
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
});