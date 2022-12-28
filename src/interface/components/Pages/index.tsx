import { Grid } from 'voxeliface';
import React, { Children, ReactNode, cloneElement, ReactElement } from 'react';
import { animated, useTransition } from 'react-spring';

export interface PagesProps {
    css?: Record<string, any>
    value: any
    children: ReactNode | ReactNode[]
}
export default function Pages({ value, children, css }: PagesProps) {
    // TODO proper typings yippee!
    const items: any[] = Children.toArray(children);
    const transitions = useTransition([value], {
        from: { left: '100%' },
        enter: { left: '0%' },
        leave: { left: '-100%' },
        config: {
            tension: 60,
            friction: 15
        }
    });
    return <Grid width="100%" height="100%" css={{
        overflow: 'hidden',
        position: 'relative',
        ...css
    }}>
        <Grid width="100%" height="100%" css={{
            top: 0,
            left: 0,
            position: 'absolute'
        }}>
            {transitions((style, value) =>
                <animated.div style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    ...style
                }}>
                    {cloneElement(items.find(c => c.props.value === value))}
                </animated.div>
            )}
        </Grid>
    </Grid>;
}