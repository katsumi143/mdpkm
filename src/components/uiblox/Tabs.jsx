import React from 'react';
import { styled } from '@stitches/react';

const StyledTabs = styled('div', {
    width: "100%",
    border: "1px solid #ffffff14",
    display: "flex",
    borderRadius: 4,
    flexDirection: "column"
});

const StyledTabsContainer = styled('div', {
    width: "100%",
    height: "32px",
    display: "flex",
    background: "#ffffff14",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
});

const StyledTab = styled('button', {
    color: "#ffffffb3",
    height: "100%",
    border: "none",
    padding: 0,
    flexGrow: 1,
    fontSize: ".75rem",
    fontWeight: 500,
    background: "none",
    fontFamily: "Nunito, sans-serif",

    "&:hover": {
        cursor: "pointer"
    }
});

const StyledPages = styled('div', {
    width: "100%",
    display: "flex",
    padding: ".6rem .8rem",
    overflow: "hidden",
    background: "#0000001a",
    flexDirection: "column",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
});

export default class Tabs extends React.Component {
    render() {
        const page = this.props.pages.find(p => p[0] === this.props.value);
        return (
            <StyledTabs onClick={_ => this.setState({ drop: true })} style={{
                borderRadius: page[3] && 0
            }}>
                <StyledTabsContainer style={{
                    borderRadius: page[3] && 0
                }}>
                    {this.props.tabs.map(([text, value], index) =>
                        <StyledTab key={index} style={{
                            color: this.props.value === value && "#fff",
                            fontWeight: this.props.value === value && 625,
                            paddingTop: this.props.value === value ? 2 : 0,
                            borderBottom: this.props.value === value ? "2px solid #6fa95b" : "none"
                        }} onClick={_ => this.props.onChange({ target: { value }})}>
                            {text}
                        </StyledTab>
                    )}
                </StyledTabsContainer>
                <StyledPages style={{
                    padding: page[2] && 0
                }}>
                    {page[1]}
                </StyledPages>
            </StyledTabs>
        );
    }
};