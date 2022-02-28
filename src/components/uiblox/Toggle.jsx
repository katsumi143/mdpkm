import React from 'react';
import styled from 'styled-components';

const Sizes = {
    medium: [
        60, 36,
        28, 28,
        4,
        24
    ],
    small: [
        40, 24,
        18, 18,
        3,
        16
    ]
};
const ToggleComponent = styled.span`
    width: ${props => Sizes[props.size][0]}px;
    height: ${props => Sizes[props.size][1]}px;
    padding: 0;
    z-index: 0;
    display: inline-flex;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    vertical-align: middle;
`;

const SwitchComponent = styled.span`
    top: 0;
    left: 0;
    color: #bdbdbd;
    width: ${props => Sizes[props.size][2]}px;
    margin: ${props => Sizes[props.size][4]}px;
    height: ${props => Sizes[props.size][3]}px;
    z-index: 1;
    position: absolute;
    transform: ${props => props.checked ? `translateX(${Sizes[props.size][5]}px)` : 'none'};
    background: #fff;
    box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
    transition: left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-radius: 50%;
`;

const TrackComponent = styled.span`
    width: 60px;
    border: ${props => props.checked ? 'none' :'1px solid rgba(255, 255, 255, 0.7)'};
    height: 100%;
    opacity: 1;
    z-index: -1;
    background: transparent;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-radius: 18px;
    background-image: ${props => props.checked ? 'radial-gradient(50% 99%, #1AAAAA 0%, #23D776 100%)' : 'none'};
`;

const InputComponent = styled.input`
    top: 0;
    left: -100%;
    width: 300%;
    height: 100%;
    cursor: pointer;
    margin: 0;
    opacity: 0;
    padding: 0;
    z-index: 1;
    position: absolute;
`;

class Toggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: props.checked ?? false
        };
    }

    render() {
        return (
            <ToggleComponent size={this.props.size ?? "medium"}>
                <SwitchComponent size={this.props.size ?? "medium"} checked={this.state.checked}>
                    <InputComponent type="checkbox" checked={this.state.checked} onChange={this.toggleClick.bind(this)}/>
                </SwitchComponent>
                <TrackComponent checked={this.state.checked}/>
            </ToggleComponent>
        );
    }

    toggleClick() {
        let newValue = !this.state.checked;
        this.setState({
            checked: newValue
        });
        if(this.props.changed) {
            this.props.changed(newValue);
        }
    }
}

export default Toggle;