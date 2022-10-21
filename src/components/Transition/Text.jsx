import { useRef, Children } from 'react';
import { useTransition, animated, config } from "react-spring";

const types = {
    fade: {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 }
    },
    fadeUp: {
        from: { opacity: 0, transform: 'translate3d(0, 50%, 0)' },
        enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        leave: { opacity: 0, transform: 'translate3d(0, -50%, 0)' }
    }
};
export default function TextTransition({
    type = 'fadeUp',
    style = {},
    inline = false,
    children,
    noOverflow = false,
    springConfig = config.default
}) {
    const placeholderRef = useRef(null);
    const trildren = Children.map(children, c => c.toString());
    const transitions = useTransition(trildren, {
        from: types[type].from,
        enter: types[type].enter,
        leave: types[type].leave,
        config: springConfig
    });

    return (
        <animated.div
            style={{
                display: inline ? 'inline-block' : 'block',
                position: 'relative',
                whiteSpace: inline ? 'nowrap' : 'normal',
                ...style,
            }}
        >
            <span ref={placeholderRef} style={{
                visibility: 'hidden'
            }}>{trildren[0]}</span>
            <div
                style={{
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'absolute',
                    overflow: noOverflow ? 'hidden' : 'visible'
                }}
            >
                {transitions((style, data, key) =>
                    <animated.div key={key} style={{
                        opacity: 0,
                        position: 'absolute',
                        ...style
                    }}>
                        {data}
                    </animated.div>
                )}
            </div>
        </animated.div>
    );
};