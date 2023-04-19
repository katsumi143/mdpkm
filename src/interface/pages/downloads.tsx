import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Grid, Typography, TextHeader } from 'voxeliface';

import Avatar from '../components/Avatar';
import { getImage } from '../../util';
import { useDownloads } from '../../voxura';
import { Download, DownloadState } from '../../../voxura/src/downloader';
export default function Downloads() {
    const { t } = useTranslation('interface');
    const downloads = useDownloads();
    const completed = downloads.filter(d => d.state === DownloadState.Finished);
    const downloading = downloads.filter(d => d.state === DownloadState.Downloading || d.state === DownloadState.Extracting || d.state === DownloadState.Pending);
    return <Grid padding=".75rem 1rem" vertical>
        <TextHeader noSelect>
            {t('downloads')}
        </TextHeader>
        {downloading.length === 0 && <Typography noSelect>
            {t('downloads.none')}
        </Typography>}
        <Grid spacing={8} vertical>
            {downloading.map((download, key) => <DownloadComponent key={key} download={download}/>)}
        </Grid>

        {completed.length > 0 && <React.Fragment>
            <Grid width="100%" margin="32px 0 8px" spacing={6} alignItems="center">
                <Typography noSelect>{t('downloads.completed')}</Typography>
                <Typography size={12} color="$secondaryColor" noSelect>({completed.length})</Typography>
                <Grid width="100%" height={1} margin="0 0 0 4px" background="$secondaryBorder2"/>
            </Grid>
            <Grid spacing={8} vertical>
                {completed.map((download, key) => <DownloadComponent key={key} download={download}/>)}
            </Grid>
        </React.Fragment>}
    </Grid>;
}

const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
function formatBytes(bytes: number) {
    if (bytes === 0)
        return '0 B';
    const k = 1024, dm = 2, i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + (sizes[i] ?? '?');
}

// TODO: move into a separate file
export interface DownloadComponentProps {
	download: Download
}
export function DownloadComponent({ download }: DownloadComponentProps) {
	const { t } = useTranslation('interface');
    const { progress } = download;
    return <Grid padding={8} spacing={12} smoothing={1} alignItems="center" cornerRadius={16} css={{
		border: 'transparent solid 1px',
        background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
	}}>
        <Avatar src={getImage(`download.${download.id}`)} size="md"/>
		<Grid vertical>
            <Typography noFlex noSelect>
				<Trans values={download.extraData} i18nKey={`mdpkm:download.${download.id}`}/>
                {download.tasks.length > 0 && <Typography size={12} color="$secondaryColor" weight={400} margin="0 6px" noSelect css={{ display: 'inline-block' }}>
					{t('download.additional', { count: download.tasks.length })}
                </Typography>}
            </Typography>
            <Grid spacing={4}>
                {isNaN(progress[0]) ? <Typography size={14} color="$secondaryColor" weight={400} noSelect>
                    {t('download.calculating')}
                </Typography> : <React.Fragment>
                    <Typography size={12} weight={400} noSelect>
                        {formatBytes(progress[0])}
                    </Typography>
                    <Typography size={12} color="$secondaryColor" weight={400} noSelect>
                        / {formatBytes(progress[1])}
                    </Typography>
                </React.Fragment>}
            </Grid>
        </Grid>
        <Grid width="40%" margin="0 8px 0 auto" spacing={2} vertical alignItems="end">
            {download.state !== DownloadState.Finished && <React.Fragment>
                <Grid width="100%" justifyContent="space-between">
                    <Typography size={14} color="$secondaryColor" weight={400} noSelect>
						{t(`download.state.${download.state}`)}
                    </Typography>
                    <Typography size={14} weight={400} noSelect>
                        {isNaN(download.percentage) ? t('download.calculating') : t('download.percentage', [Math.floor(download.percentage)])}
                    </Typography>
                </Grid>
                <Grid width="100%" height={6} background="$buttonBackground" cornerRadius={3}>
                    <Grid width={download.percentage + '%'} height="100%" background="$sliderTrackBackground" cornerRadius={3} css={{
                        transition: 'width .5s'
                    }}/>
                </Grid>
            </React.Fragment>}
            {download.state === DownloadState.Finished && <React.Fragment>
               	<Typography size={14} color="$secondaryColor" weight={400} spacing={4} noSelect>
					<IconBiCheckLg style={{
						fontSize: 16,
						marginRight: 4
					}}/>
					{t('download.state.1')}
				</Typography>
            </React.Fragment>}
        </Grid>
    </Grid>;
}