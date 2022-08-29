import React from 'react';
import { useTransition, animated } from 'react-spring';

export default function Transition({ type, ...props }) {
    const transitions = useTransition(props, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 }
    });

    return (
        <div style={{ position: 'relative' }}>
            <type {...props}/>
            <div
                style={{
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'absolute'
                }}
            >
                {transitions((style, props) =>
                    <animated.div style={{
                        position: 'absolute',
                        ...style
                    }}>
                        <type {...props}/>
                    </animated.div>
                )}
            </div>
        </div>
    );
};