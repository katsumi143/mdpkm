import React from 'react';
import { Archive } from 'react-bootstrap-icons';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '/voxeliface/components/Grid';
import Typography from '/voxeliface/components/Typography';

import Util from '../common/util';
export default function SkinList({ selected, onSelect }) {
    const skins = useSelector(state => state.skins.data);
    const account = useSelector(state => state.accounts.selected);
    return <React.Fragment>
        <Grid width="100%" padding=".9rem 1.2rem" alignItems="center" background="$secondaryBackground" justifyContent="space-between">
            <Grid spacing={4} direction="vertical">
                <Typography color="$primaryColor" weight={600} family="Nunito" lineheight={1}>
                    <Archive size={20} style={{ marginRight: 12 }}/>
                    Skin Management
                </Typography>
                <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                    Selected Account: {Util.getAccount(useSelector).profile.name}
                </Typography>
            </Grid>
        </Grid>
        <Grid height="100%" margin="8px 0 0" spacing={8} direction="vertical" alignItems="center" css={{
            overflowY: "auto"
        }}>
            {skins[account]?.map(skin =>
                <Typography>
                    placeholder
                </Typography>
            )}
        </Grid>
    </React.Fragment>;
};