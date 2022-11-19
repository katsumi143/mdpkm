import React from 'react';
import { useTranslation } from 'react-i18next';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Typography from '/voxeliface/components/Typography';
import TextHeader from '/voxeliface/components/Typography/Header';

import { useDownloads } from '../../voxura';
import { DownloadType, DownloadState } from '../../../voxura/src/downloader';
export default function Downloads() {
    const { t } = useTranslation();
    const downloads = useDownloads();
    const completed = downloads.filter(d => d.state === DownloadState.Completed);
    const downloading = downloads.filter(d => d.state === DownloadState.Downloading);
    return <Grid padding=".75rem 1rem" direction="vertical">
        <TextHeader>
            {t('app.mdpkm.home.navigation.downloads')}
        </TextHeader>
        {downloading.length === 0 && <Typography>
            There's nothing downloading right now.
        </Typography>}
        <Grid spacing={8} direction="vertical">
            {downloading.map(Download)}
        </Grid>

        {completed.length > 0 && <React.Fragment>
            <Grid width="100%" margin="32px 0 8px" spacing={6} alignItems="center">
                <Typography size="1.1rem">Completed</Typography>
                <Typography size=".8rem" color="$secondaryColor">({completed.length})</Typography>
                <Grid width="100%" height={1} margin="0 0 0 4px" background="$secondaryBorder2"/>
            </Grid>
            <Grid spacing={8} direction="vertical">
                {completed.map(Download)}
            </Grid>
        </React.Fragment>}
    </Grid>;
};

const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024, dm = 2, i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + (sizes[i] ?? '?');
};
function Download(download, key) {
    const progress = download.totalProgress;
    return <Grid key={key} padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={8}>
        <Image src={download.icon} size={48} borderRadius={4}/>
        <Grid direction="vertical">
            <Typography spacing={6} horizontal>
                {download.name}
                {download.subDownloads.length > 0 && <Typography size=".8rem" color="$secondaryColor" weight={400}>
                    (plus {download.subDownloads.length} additional download{download.subDownloads.length === 1 ? '' : 's'})
                </Typography>}
            </Typography>
            <Grid spacing={4}>
                {isNaN(progress[0]) ? <Typography size=".8rem" color="$secondaryColor" weight={400}>
                    Calculating...
                </Typography> : <React.Fragment>
                    <Typography size=".8rem" weight={400}>
                        {formatBytes(progress[0])}
                    </Typography>
                    <Typography size=".8rem" color="$secondaryColor" weight={400}>
                        / {formatBytes(progress[1])}
                    </Typography>
                </React.Fragment>}
            </Grid>
        </Grid>
        <Grid width="40%" margin="0 8px 0 auto" spacing={2} direction="vertical" alignItems="end">
            {download.state === DownloadState.Downloading && <React.Fragment>
                <Grid width="100%" justifyContent="space-between">
                    <Typography size=".8rem" color="$secondaryColor" weight={400}>
                        {download.type === DownloadType.Download && 'Downloading...'}
                        {download.type === DownloadType.Extract && 'Extracting...'}
                    </Typography>
                    <Typography size=".8rem" weight={400}>
                        {isNaN(download.percentage) ? 'Calculating...' :`${Math.floor(download.percentage)}%`}
                    </Typography>
                </Grid>
                <Grid width="100%" height={6} background="$buttonBackground" borderRadius={3}>
                    <Grid width={download.percentage + '%'} height="100%" background="$sliderTrackBackground" borderRadius={3} css={{
                        transition: 'width .5s'
                    }}/>
                </Grid>
            </React.Fragment>}
            {download.state === DownloadState.Completed && <React.Fragment>
                <Grid>
                    <Typography size=".8rem" color="$secondaryColor" weight={400} horizontal>
                        <IconBiCheckLg style={{
                            fontSize: 16,
                            marginRight: 4
                        }}/>
                        Completed
                    </Typography>
                </Grid>
            </React.Fragment>}
        </Grid>
    </Grid>;
};