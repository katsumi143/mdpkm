import React from 'react';
import { open } from '@tauri-apps/api/shell';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';

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
            <Grid width={120} height={130} onClick={view} vertical smoothing={1} background="$secondaryBackground2" borderRadius={8} justifyContent="space-between" css={{
                cursor: 'pointer'
            }}>
				<AspectRatio.Root ratio={3 / 2}>
                	<ImageWrapper src={item.image} width="100%" ratio={3 / 2} height="100%" canPreview previewWidth={256}/>
				</AspectRatio.Root>
				<Grid padding={8} vertical>
                    <Typography size={12} color="$secondaryColor" weight={400} noSelect lineheight={1.1}>
                        {item.source.displayName}
                    </Typography>
                    <Typography size={14} noSelect whitespace="nowrap" css={{
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