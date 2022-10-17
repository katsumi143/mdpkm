import React from 'react';
import { keyframes } from '@stitches/react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Grid from '/voxeliface/components/Grid';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import InstanceIcon from './InstanceIcon';

import Patcher from '/src/common/plugins/patcher';
import { useInstance } from '../common/voxura';
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

export default Patcher.register(function Instance({ id, css, onView }) {
    const { t } = useTranslation();
    const instance = useInstance(id);
    const isCompact = useSelector(state => state.settings.uiStyle) === 'compact';
    if (!instance)
        return;
    return (
        <Grid width="100%" padding={isCompact ? '0 8px' : '4px 16px'} alignItems="start" css={{
            opacity: 0,
            animation: `${Animation} 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
            animationFillMode: 'forwards',
            ...css
        }}>
            <Grid width="100%" height="100%" padding={isCompact ? 6 : 8} spacing={16} alignItems="center" background="$primaryBackground" borderRadius={isCompact ? 4 : 8} justifyContent="space-between" css={{
                border: '$secondaryBorder solid 1px',
                position: 'relative'
            }}>
                <Grid width="calc(100% - 80px)" spacing={isCompact ? '.6rem' : '1rem'} alignItems="center">
                    <InstanceIcon size={isCompact ? 36 : 46} instance={instance} hideLoader={isCompact}/>
                    <Grid width="-webkit-fill-available" spacing={isCompact ? 2 : 4} direction="vertical" alignItems="start" css={{ overflow: 'hidden' }}>
                        <Typography
                            size={isCompact ? 13 : '1rem'}
                            width="100%"
                            weight={isCompact ? 400 : 500}
                            textalign="start"
                            lineheight={1}
                            whitespace="nowrap"
                        >
                            {instance.name}
                        </Typography>
                        <Typography
                            size={isCompact ? 11 : '.8rem'}
                            color="$secondaryColor"
                            weight={isCompact ? 300 : 400}
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
                    <Button size={isCompact ? 'smaller' : 'small'} theme="secondary" onClick={onView} disabled={instance.corrupt}>
                        {t('app.mdpkm.common:actions.view')}
                        <IconBiCaretRightFill/>
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
});