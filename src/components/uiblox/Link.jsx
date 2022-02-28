import React from 'react';
import { styled } from '@stitches/react';
import { Link as RouterLink } from 'react-router-dom';

const StyledLink = styled(RouterLink, {
    color: "#c7c6c6",
    cursor: "pointer",
    display: "flex",
    fontSize: "1rem",
    transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    fontFamily: "HCo Gotham SSm, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif",
    fontWeight: 500,
    lineHeight: 1.43,
    alignItems: "center",
    textDecoration: "none",

    "&:hover": {
        color: "#fff"
    }
});

const StyledIcon = styled('i', {
    color: "inherit",
    marginRight: 8
});

export default class Link extends React.Component {
    render() {
        return (
            <StyledLink {...this.props}>
                <StyledIcon className={this.props.icon} style={{
                    display: this.props.className ? "block" : "none"
                }}/>
                {this.props.children ?? "Link"}
            </StyledLink>
        );
    }
};