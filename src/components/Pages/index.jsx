import React from 'react';
import { animated, useTransition } from 'react-spring';

import Grid from '/voxeliface/components/Grid';
export default function Pages({ value, children, css }) {
    const transitions = useTransition([value], {
        from: { left: '100%' },
        enter: { left: '0%' },
        leave: { left: '-100%' }
    });
    return <Grid width="100%" height="100%" css={{
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
                    {React.cloneElement(children.find(c => c.props.value === value))}
                </animated.div>
            )}
        </Grid>
    </Grid>;
};