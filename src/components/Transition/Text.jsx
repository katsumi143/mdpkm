import * as React from "react";
import * as PropTypes from "prop-types";

import { useSpring, useTransition, animated, config } from "react-spring";

const newChildren = data => ({ key: Date.now(), data: React.Children.map(data, d => d.toString()).join('') });

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
    type,
    children,
    inline,
    delay,
    className,
    style,
    noOverflow,
    springConfig
}) {
    const placeholderRef = React.useRef(null);
    const [content, setContent] = React.useState(() => newChildren(children));
    const [timeoutId, setTimeoutId] = React.useState(0);
    const [width, setWidth] = React.useState({ width: inline ? 0 : "auto" });
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
    React.useEffect(() => {
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

    React.useEffect(() => () => clearTimeout(timeoutId), []);

    return (
        <animated.div
            className={`transition ${className}`}
            style={{
                ...animatedProps,
                whiteSpace: inline ? "nowrap" : "normal",
                display: inline ? "inline-block" : "block",
                position: "relative",
                ...style,
            }}
        >
            <span ref={placeholderRef} style={{ visibility: "hidden" }} className="transition_placeholder"/>
            <div
                className="transition_inner"
                style={{
                    overflow: noOverflow ? "hidden" : "visible",
                    display: "flex",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%"
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

TextTransition.propTypes = {
    type: PropTypes.oneOf(Object.keys(types)),
    inline: PropTypes.bool,
    noOverflow: PropTypes.bool,
    delay: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
    springConfig: PropTypes.any,
};

TextTransition.defaultProps = {
    type: "fadeUp",
    noOverflow: false,
    inline: false,
    springConfig: config.default,
    delay: 0,
    className: "",
    style: {},
};