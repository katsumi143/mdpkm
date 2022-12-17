import { open } from '@tauri-apps/api/shell';
import { styled } from '@stitches/react';
import React, { ReactNode } from 'react';

import { Link, Tooltip } from 'voxeliface';

const StyledTrigger = styled(Tooltip.Trigger, {
    border: 'none',
    padding: 0,
    fontSize: 'inherit',
    background: 'none',
    fontFamily: 'inherit',
    lineHeight: 'inherit'
});
export type BrowserLinkProps = {
    href: string,
    children?: ReactNode | ReactNode[]
};
export default function BrowserLink({ href, children }: BrowserLinkProps) {
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