import { useRef, useState, useEffect, Children } from 'react';
import { useSpring, useTransition, animated, config } from "react-spring";

const newChildren = data => ({
    key: Date.now(),
    data: Children.map(data, d => d.toString()).join('')
});
const types = {
    fade: {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 }
    },
    fadeUp: {
        from: { opacity: 0, transform: 'translate3d(0, 100%, 0)' },
        enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        leave: { opacity: 0, transform: 'translate3d(0, -100%, 0)' }
    }
};
export default function TextTransition({
    type = 'fadeUp',
    delay = 0,
    style = {},
    inline = false,
    children,
    className = '',
    noOverflow = false,
    springConfig = config.default
}) {
    const placeholderRef = useRef(null);
    const [width, setWidth] = useState({ width: inline ? 0 : 'auto' });
    const [content, setContent] = useState(() => newChildren(children));
    const [timeoutId, setTimeoutId] = useState(0);
    const transitions = useTransition(content, {
        from: types[type].from,
        enter: types[type].enter,
        leave: types[type].leave,
        config: springConfig
    });
    const animatedProps = useSpring({
        to: width,
        config: springConfig
    });
    useEffect(() => {
        setTimeoutId(
            setTimeout(() => {
                if (!placeholderRef.current)
                    return;
                placeholderRef.current.innerHTML = children.toString();
                if (inline)
                    setWidth({ width: placeholderRef.current.offsetWidth });
                setContent(newChildren(children));
            }, delay)
        );
    }, [children]);
    useEffect(() => () => clearTimeout(timeoutId), []);

    return (
        <animated.div
            className={`transition ${className}`}
            style={{
                ...animatedProps,
                display: inline ? 'inline-block' : 'block',
                position: 'relative',
                whiteSpace: inline ? 'nowrap' : 'normal',
                ...style,
            }}
        >
            <span ref={placeholderRef} className="transition_placeholder" style={{
                visibility: 'hidden'
            }}/>
            <div
                className="transition_inner"
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
                {transitions((style, { key, data }) =>
                    <animated.div key={key} style={{
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