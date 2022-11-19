import React from 'react';
import { keyframes } from '@stitches/react';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';

import InstanceIcon from './InstanceIcon';
import { Link, Grid, Typography, ContextMenu } from '../../../voxeliface';

import Patcher from '../../plugins/patcher';
import { toast } from '../../util';
import type { Instance } from '../../../voxura';
import { INSTANCE_STATE_ICONS } from '../../util/constants';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
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
const viewAnimation = keyframes({
    '100%': {
        opacity: 0,
        transform: 'translateX(100%)'
    }
});

type InstanceProps = {
    css: Record<string, any>,
    instance: Instance,
    selected?: boolean
};
export default Patcher.register(function Instance({ css, selected, instance }: InstanceProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const StateIcon = INSTANCE_STATE_ICONS[instance.state];
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    if (!instance)
        return;

    const copyId = () => {
        writeText(instance.id).then(() => toast(t('app.mdpkm.common:toast.copied'), t('app.mdpkm.common:toast.copied_instance_id.body')));
    };
    const view = () => {
        dispatch(setCurrentInstance(instance.id));
        dispatch(setPage('instances'));
    };
    return <ContextMenu.Root>
        <ContextMenu.Trigger fullWidth>
            <Grid width="100%" height="fit-content" padding={isCompact ? '0 8px' : '0 8px'} alignItems="start" css={{
                cursor: 'default',
                opacity: 0,
                animation: `${Animation} 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
                animationFillMode: 'forwards',
                ...css
            }}>
                <Grid width="100%" height="100%" alignItems="center" borderRadius={isCompact ? 8 : 16} justifyContent="space-between" css={{
                    border: selected ? 'transparent solid 1px' : '$secondaryBorder solid 1px',
                    overflow: 'hidden',
                    background: selected ? '$gradientBackground2 padding-box, $gradientBorder2 border-box' : '$primaryBackground'
                }}>
                    <Grid padding={isCompact ? 6 : 8} spacing={isCompact ? 10 : 12} alignItems="center" css={{
                        overflow: 'hidden'
                    }}>
                        <InstanceIcon size={isCompact ? 36 : 48} instance={instance} hideLoader={isCompact} borderRadius={isCompact ? 4 : 8}/>
                        <Grid spacing={isCompact ? 2 : 4} direction="vertical" alignItems="start" css={{ overflow: 'hidden' }}>
                            <Typography
                                size={isCompact ? 14 : 16}
                                width="100%"
                                weight={isCompact ? 400 : 500}
                                textalign="start"
                                lineheight={1}
                                whitespace="nowrap"
                                css={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {instance.name}
                            </Typography>
                            <Typography
                                size={isCompact ? 11 : 12}
                                color="$secondaryColor"
                                weight={400}
                                spacing={5}
                                textalign="start"
                                lineheight={1}
                                horizontal
                                whitespace="nowrap"
                            >
                                <StateIcon fontSize={isCompact ? 8 : 10}/>
                                {t(`app.mdpkm.instances:state.${instance.state}`)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Link size={isCompact ? 11 : 12} height="100%" onClick={view} padding="0 16px" css={{
                        animation: selected ? `${viewAnimation} .25s ease-in` : undefined,
                        animationFillMode: 'forwards'
                    }}>
                        {t('interface:common.action.view')}
                        <IconBiArrowRight/>
                    </Link>
                </Grid>
            </Grid>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
            <ContextMenu.MenuLabel>
                Instance Options ({instance.name})
            </ContextMenu.MenuLabel>
            <ContextMenu.MenuItem>
                {t('app.mdpkm.common:actions.launch')}
            </ContextMenu.MenuItem>
            <ContextMenu.MenuItem onClick={view}>
                {t('app.mdpkm.common:actions.view')}
            </ContextMenu.MenuItem>
            <ContextMenu.MenuSeparator/>
            <ContextMenu.MenuItem>
                Instance Settings
            </ContextMenu.MenuItem>
            <ContextMenu.MenuSeparator/>
            <ContextMenu.MenuItem onClick={copyId}>
                Copy ID
            </ContextMenu.MenuItem>
        </ContextMenu.Content>
    </ContextMenu.Root>;
});