import React from 'react';
import { styled } from '@stitches/react';
import { Tag, Download, Calendar3 } from 'react-bootstrap-icons';

import Util from '../common/util';

import Grid from '../components/uiblox/Grid';
import Image from '../components/uiblox/Image';
import Spinner from '../components/uiblox/Spinner';
import Typography from '../components/uiblox/Typography';

const StyledModpack = styled('div', {
    width: "100%",
    border: "none",
    padding: 8,
    display: "flex",
    maxWidth: "100%",
    whiteSpace: "nowrap",
    alignItems: "flex-start",
    borderRadius: 4,
    flexDirection: "column",
    backgroundColor: "#ffffff05"
});

const StyledDescription = styled('div', {
    width: "100%",
    color: "#fff",
    padding: "0 32px",
    fontSize: "1rem",
    fontWeight: 400,
    fontFamily: "Nunito, sans-serif",

    "& *": {
        maxWidth: "100%",
    },
    "& a": {
        color: "#306fbd",
        fontWeight: 700,

        "&:hover": {
            cursor: "pointer"
        }
    },
    " & p, & a, & span, & li": {
        whitespace: "pre-wrap",
        fontFamily: "Nunito, sans-serif !important"
    },
    "& img": {
        height: "auto",
        objectFit: "contain"
    },
    "& iframe": {
        border: "none",
        borderRadius: 8
    }
});

export default class Modpack extends React.Component {
    render() {
        const { data, align, buttons, summary, selected } = this.props;

        const { displayIcon: icon } = data;
        const dateNow = new Date();
        return (
            <StyledModpack>
                <Grid width="100%">
                    <Grid direction="vertical" alignItems="center">
                        <Image src={icon} size={64} borderRadius={4}/>
                    </Grid>
                    <Grid width="100%" height="100%" direction="vertical" justifyContent="space-between">
                        <Grid width="100%" height={summary && align !== true ? null : "100%"} margin="0 0 0 12px" direction="vertical" alignItems={summary && align !== true ? "start" : "center"} justifyContent={this.props.summary && align !== true ? "flex-start" : "center"}>
                            <Grid width="100%" direction="vertical" alignItems="flex-start">
                                <Grid width="100%" direction="horizontal" justifyContent="space-between">
                                    <Grid direction="vertical">
                                        <Grid spacing="6px" direction="horizontal" alignItems="center">
                                            <Typography text={data.name} size={["1rem", "1.2rem", "1.2rem"][this.props.size || 0]} textalign="start" />
                                            <Typography text={`by ${data.authors.map(a => a.name).join(', ')}`} size="0.8rem" color="#989898" />
                                        </Grid>
                                        <Typography text={data.summary} color="#cbcbcb" width="100%" margin="0 0 8px 0" textalign="start" whitespace="pre-line" />
                                    </Grid>
                                    <Grid spacing="8px">
                                        {buttons}
                                    </Grid>
                                </Grid>
                                <Grid spacing="16px" direction="horizontal" alignItems="center">
                                    <Grid spacing="12px" direction="horizontal" alignItems="center">
                                        <Download color="#cbcbcb" size="1.2rem"/>
                                        <Grid direction="vertical" alignItems="flex-start">
                                            <Typography text="Downloads" size="0.9rem" color="#cbcbcb" weight={600} />
                                            <Typography text={
                                                new Intl.NumberFormat('en-us', {}).format(data.downloads)
                                            } size="0.9rem" className="inter" />
                                        </Grid>
                                    </Grid>
                                    <Grid spacing="12px" direction="horizontal" alignItems="center">
                                        <Calendar3 color="#cbcbcb" size="1.2rem" />
                                        <Grid direction="vertical" alignItems="flex-start">
                                            <Typography text="Created" size="0.9rem" color="#cbcbcb" weight={600} />
                                            <Typography text={data.dateCreated === 0 ? "N/A"
                                                : Util.formatDateBetween(new Date(data.dateCreated), dateNow, "x-ymhs-ago")
                                            } size="0.9rem" className="inter" />
                                        </Grid>
                                    </Grid>
                                    <Grid spacing="12px" direction="horizontal" alignItems="center">
                                        <Typography className="bi bi-pencil-square" color="#cbcbcb" size="1.2rem" />
                                        <Grid direction="vertical" alignItems="flex-start">
                                            <Typography text="Updated" size="0.9rem" color="#cbcbcb" weight={600} />
                                            <Typography text={data.dateUpdated === 0 ? "N/A"
                                                : Util.formatDateBetween(new Date(data.dateUpdated), dateNow, "x-ymhs-ago")
                                            } size="0.9rem" className="inter" />
                                        </Grid>
                                    </Grid>
                                    <Grid spacing="12px" direction="horizontal" alignItems="center">
                                        <Tag color="#cbcbcb" size="1.2rem" />
                                        <Grid direction="vertical" alignItems="flex-start">
                                            <Typography text="Available For" size="0.9rem" color="#cbcbcb" weight={600} />
                                            <Typography text={data.latestGameVersion} size="0.9rem" className="inter" />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid width="100%" direction="vertical">
                    {(selected && data.htmlDescription) &&
                        <Grid width="100%" height="100%" direction="vertical">
                            <Grid width="100%" height="100%" direction="vertical" alignItems="flex-start" style={{
                                overflow: "hidden scroll"
                            }}>
                                <StyledDescription dangerouslySetInnerHTML={{ __html: data.htmlDescription }} />
                            </Grid>
                        </Grid>
                    }
                    {(selected && !data.htmlDescription) &&
                        <Spinner/>
                    }
                </Grid>
            </StyledModpack>
        );
    }
};