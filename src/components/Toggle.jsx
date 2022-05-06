import React, { useState } from 'react';
import { styled } from '@stitches/react';

const StyledToggle = styled('span', {
    zIndex: 0,
    padding: 0,
    display: 'inline-flex',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    flexShrink: 0,
    verticalAlign: 'middle',

    variants: {
        size: {
            medium: {
                width: 60,
                height: 36
            },
            small: {
                width: 40,
                height: 24
            }
        }
    }
});

const StyledSwitch = styled('span', {
    top: 0,
    left: 0,
    color: '#bdbdbd',
    zIndex: 1,
    position: 'absolute',
    background: '#fff',
    boxShadow: '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    transition: 'left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    borderRadius: '50%',

    variants: {
        size: {
            medium: {
                width: 28,
                margin: 4,
                height: 28,
                transform: 'translateX(24px)'
            },
            small: {
                width: 18,
                margin: 3,
                height: 18,
                transform: 'translateX(16px)'
            }
        }
    }
});

const StyledTrack = styled('span', {
    width: 60,
    zIndex: -1,
    height: '100%',
    opacity: 1,
    background: 'transparent',
    transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    borderRadius: 18
});

const StyledInput = styled('input', {
    top: 0,
    left: '-100%',
    width: '300%',
    height: '100%',
    cursor: 'pointer',
    margin: 0,
    zIndex: 1,
    opacity: 0,
    padding: 0,
    position: 'absolute'
});

export default function Toggle({ size = "medium", value = false, onChange, disabled }) {
    const [checked, setChecked] = useState(value);
    return (
        <StyledToggle size={size} css={{
            opacity: disabled ? .5 : 1
        }}>
            <StyledSwitch size={size} css={{
                transform: checked ? undefined : 'none'
            }}>
                <StyledInput type="checkbox" value={checked} onClick={() => {
                    onChange({ target: { value: !checked }});
                    setChecked(!checked);
                }} disabled={disabled} css={{ cursor: disabled ? "not-allowed" : "pointer" }}/>
            </StyledSwitch>
            <StyledTrack css={{
                border: checked ? 'none' :'1px solid rgba(255, 255, 255, 0.7)',
                backgroundImage: checked ? 'radial-gradient(50% 99%, #1AAAAA 0%, #23D776 100%)' : 'none'
            }}/>
        </StyledToggle>
    );
};