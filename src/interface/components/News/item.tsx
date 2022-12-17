import React from 'react';
import { open } from '@tauri-apps/api/shell';

import ImageWrapper from '../ImageWrapper';
import type NewsItem from '../../../mdpkm/news/item';
import { Grid, Tooltip, Typography } from 'voxeliface';
export type NewsItemProps = {
    item: NewsItem<unknown>
};
export default function NewsItemComponent({ item }: NewsItemProps) {
	const view = () => open(item.url);
    return <Tooltip.Root delayDuration={50}>
        <Tooltip.Trigger asChild>
            <Grid width={96} onClick={view} vertical background="$secondaryBackground2" borderRadius={8} css={{
                cursor: 'pointer',
				minWidth: 96,
                overflow: 'hidden'
            }}>
                <ImageWrapper src={item.image} size={96} canPreview background="$secondaryBackground"/>
                <Grid padding={8} vertical>
                    <Typography size={12} color="$secondaryColor" weight={400} lineheight={1.1}>
                        {item.source.displayName}
                    </Typography>
                    <Typography size={14} whitespace="nowrap" css={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {item.title}
                    </Typography>
                </Grid>
            </Grid>
        </Tooltip.Trigger>
        <Tooltip.Content sideOffset={4}>
            <Tooltip.Arrow/>
            <Typography size={12} margin="0 0 2px" color="$secondaryColor" lineheight={1}>
                {item.source.displayName}
            </Typography>
            {item.title}
        </Tooltip.Content>
    </Tooltip.Root>;
};