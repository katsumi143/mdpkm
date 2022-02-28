import React from 'react';
import { styled } from '@stitches/react';
import { CaretDownFill } from 'react-bootstrap-icons';

import Grid from '../Grid';

const StyledSelect = styled('button', {
    color: "#fff",
    width: "fit-content",
    border: "1px solid #343434",
    outline: 0,
    display: "flex",
    padding: "8px 16px",
    position: "relative",
    minWidth: 210,
    fontSize: ".9rem",
    transition: "border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    fontWeight: 500,
    alignItems: "center",
    fontFamily: "HCo Gotham SSm, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif",
    borderRadius: 8,
    backgroundColor: "#181818",

    "&:hover": {
        cursor: "pointer",
        borderColor: "#797979",
        backgroundColor: "#242424"
    }
});

const StyledInput = styled('input', {
    top: 0,
    left: 0,
    width: "100%",
    opacity: 0,
    position: "absolute",
    pointerEvents: "none"
});

const StyledDropdown = styled('div', {
    top: "calc(100% + 8px)",
    left: "50%",
    width: "100%",
    border: "1px solid #343434",
    zIndex: 1000,
    display: "flex",
    overflow: "hidden scroll",
    position: "absolute",
    maxHeight: "14rem",
    transform: "translateX(-50%)",
    borderRadius: 8,
    flexDirection: "column",

    "& *:last-child": {
        border: "none"
    }
});

export default class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drop: false,
            value: props.value
        };

        this.setValue = this.setValue.bind(this);
    }

    render() {
        return (
            <StyledSelect onClick={_ => this.setState({ drop: true })}>
                <StyledInput id={this.props.id} value={this.state.value} readOnly={this.props.readOnly} disabled={this.props.disabled} onChange={this.props.onChange} placeholder={this.props.placeholder} styled={{
                    borderRadius: this.state.drop ? "4px 4px 0 0" : "4px",
                }}/>
                <Grid width="100%" spacing="8px" alignItems="center" justifyContent="space-between">
                    {this.state.value !== undefined ? this.props.multi ? this.props.renderValues(this.props.children.filter(c => this.state.value.indexOf(c.props.value) >= 0), this.state.value) : this.props.children.find(c => c.props.value === this.state.value)?.props?.children : this.props.placeholder}
                    <CaretDownFill/>
                </Grid>
                {this.state.drop &&
                    <StyledDropdown direction="vertical">
                        {this.props.children.map((child, index) => React.cloneElement(child, { key: index, _set: this.setValue, _sel: this.props.multi ? this.state.value.indexOf(child.props.value) >= 0 : this.state.value === child.props.value }))}
                    </StyledDropdown>
                }
            </StyledSelect>
        );
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.drop !== false)
            this.setState({ drop: false });
        if (prevState.value !== this.state.value && this.props.onChange)
            this.props.onChange({ target: { value: this.state.value }});
        if (prevProps.value !== this.props.value && this.props.value !== this.state.value)
            this.setState({ value: this.props.value });
    }

    setValue(value) {
        if(this.props.multi) {
            const index = this.state.value.indexOf(value);
            if(index >= 0)
                value = this.state.value.filter(v => v !== value);
            else
                value = [...this.state.value, value]
        }
        return this.setState({
            value
        });
    }
};