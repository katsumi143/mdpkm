import React from 'react';
import { open } from '@tauri-apps/api/shell';
import { styled } from '@stitches/react';

import Link from '/voxeliface/components/Link';
import * as Tooltip from '/voxeliface/components/Tooltip';

const StyledTrigger = styled(Tooltip.Trigger, {
    border: 'none',
    padding: 0,
    fontSize: 'inherit',
    background: 'none',
    fontFamily: 'inherit',
    lineHeight: 'inherit'
});
export default function BrowserLink({ href, children }) {
    return <Tooltip.Root delayDuration={1000}>
        <StyledTrigger>
            <Link onClick={() => open(href)}>{children}</Link>
        </StyledTrigger>
        <Tooltip.Content side="top" sideOffset={8}>
            {href}
            <Tooltip.Arrow/>
        </Tooltip.Content>
    </Tooltip.Root>
};