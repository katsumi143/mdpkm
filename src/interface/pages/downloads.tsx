import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Image, Typography, TextHeader } from 'voxeliface';

import { useDownloads } from '../../voxura';
import { Download, DownloadState } from '../../../voxura/src/downloader';
export default function Downloads() {
    const { t } = useTranslation('interface');
    const downloads = useDownloads();
    const completed = downloads.filter(d => d.state === DownloadState.Completed);
    const downloading = downloads.filter(d => d.state === DownloadState.Downloading);
    return <Grid padding=".75rem 1rem" vertical>
        <TextHeader>
            {t('downloads')}
        </TextHeader>
        {downloading.length === 0 && <Typography>
            {t('downloads.none')}
        </Typography>}
        <Grid spacing={8} vertical>
            {downloading.map((download, key) => <DownloadComponent key={key} download={download}/>)}
        </Grid>

        {completed.length > 0 && <React.Fragment>
            <Grid width="100%" margin="32px 0 8px" spacing={6} alignItems="center">
                <Typography size="1.1rem">{t('downloads.completed')}</Typography>
                <Typography size=".8rem" color="$secondaryColor">({completed.length})</Typography>
                <Grid width="100%" height={1} margin="0 0 0 4px" background="$secondaryBorder2"/>
            </Grid>
            <Grid spacing={8} vertical>
                {completed.map((download, key) => <DownloadComponent key={key} download={download}/>)}
            </Grid>
        </React.Fragment>}
    </Grid>;
};

const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
function formatBytes(bytes: number) {
    if (bytes === 0)
        return '0 B';
    const k = 1024, dm = 2, i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + (sizes[i] ?? '?');
};

export type DownloadComponentProps = {
	key: number,
	download: Download
};
function DownloadComponent({ key, download }: DownloadComponentProps) {
	const { t } = useTranslation('interface');
    const progress = download.totalProgress;
    return <Grid key={key} padding={8} spacing={12} alignItems="center" borderRadius={16} css={{
		border: 'transparent solid 1px',
        background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
	}}>
        <Image src={download.icon} size={48} borderRadius={4}/>
        <Grid vertical>
            <Typography spacing={6} horizontal>
                {download.name}
                {download.subDownloads.length > 0 && <Typography size={12} color="$secondaryColor" weight={400}>
					{t('download.additional', { count: download.subDownloads.length })}
                </Typography>}
            </Typography>
            <Grid spacing={4}>
                {isNaN(progress[0]) ? <Typography size={14} color="$secondaryColor" weight={400}>
                    {t('download.calculating')}
                </Typography> : <React.Fragment>
                    <Typography size={12} weight={400}>
                        {formatBytes(progress[0])}
                    </Typography>
                    <Typography size={12} color="$secondaryColor" weight={400}>
                        / {formatBytes(progress[1])}
                    </Typography>
                </React.Fragment>}
            </Grid>
        </Grid>
        <Grid width="40%" margin="0 8px 0 auto" spacing={2} vertical alignItems="end">
            {download.state === DownloadState.Downloading && <React.Fragment>
                <Grid width="100%" justifyContent="space-between">
                    <Typography size={14} color="$secondaryColor" weight={400}>
						{t(`download.type.${download.type}`)}
                    </Typography>
                    <Typography size={14} weight={400}>
                        {isNaN(download.percentage) ? t('download.calculating') : t('download.percentage', [Math.floor(download.percentage)])}
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
                    <Typography size={14} color="$secondaryColor" weight={400} spacing={4} horizontal>
                        <IconBiCheckLg style={{
                            fontSize: 16,
                            marginRight: 4
                        }}/>
                        {t('download.completed')}
                    </Typography>
                </Grid>
            </React.Fragment>}
        </Grid>
    </Grid>;
};