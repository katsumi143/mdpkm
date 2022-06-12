import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'react-bootstrap-icons';

import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import Typography from '/voxeliface/components/Typography';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Patcher from '/src/common/plugins/patcher';
import PluginLoader from '../common/plugins/loader';
import PluginSystem from '../common/plugins/system';
export default Patcher.register(function SelectInstanceType({ back, types, loading, chooseLoader, importInstance }) {
    const { t } = useTranslation();
    return (
        <Grid width="100%" direction="vertical" alignItems="center">
            <Grid width="100%" padding="1rem 0" spacing={8} direction="vertical" alignItems="center" css={{
                borderBottom: '1px solid $tagBorder'
            }}>
                <Typography size="1.2rem" color="$primaryColor" family="Raleway" lineheight={1}>
                    {t('app.mdpkm.common:headers.adding_instance')}
                </Typography>
                <Typography size=".9rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                    {t('app.mdpkm.select_instance_type.header')}
                </Typography>
            </Grid>
            <Grid width="100%" height="-webkit-fill-available" spacing="1rem" padding="1rem 0" direction="vertical" alignItems="center" css={{
                overflow: 'auto'
            }}>
                {types.filter(({ types }) => types.length > 0).map(({ name, types }) => <React.Fragment key={name}>
                    <Grid width="70%" height={2} margin="8px 0" background="$tagBorder" borderRadius={1}>
                        <Typography size=".9rem" color="$secondaryColor" weight={600} family="Nunito" css={{
                            top: 0,
                            left: "50%",
                            padding: "0 8px",
                            position: "relative",
                            transform: "translateX(-50%)",
                            background: "$primaryBackground"
                        }}>
                            {t(`app.mdpkm.common:loaders.categories.${name}`)}
                        </Typography>
                    </Grid>
                    {types.map(({ id, icon, isLoader, isImport }, index) => {
                        const loaderData = API.getLoader(id);
                        const pluginData = PluginLoader.loaded[loaderData?.source?.id];
                        return <Grid key={index} width="70%" padding="16px 24px" background="#0000001a" borderRadius={4} alignItems="center" justifyContent="space-between">
                            <Grid alignItems="center">
                                <Image src={icon ?? 'img/icons/brand_default.svg'} size={48} borderRadius={4}/>
                                <Grid margin="0 0 0 24px" direction="vertical" alignItems="start">
                                    <Typography color="$primaryColor" whitespace="nowrap" css={{ gap: 4 }}>
                                        {t(`app.mdpkm.common:loaders.${id}`)}
                                        {loaderData?.source instanceof PluginSystem &&
                                            <Typography size=".8rem" color="$secondaryColor" family="Nunito">
                                                added by {pluginData.manifest.name}
                                            </Typography>
                                        }
                                    </Typography>
                                    <Typography size=".8rem" color="$secondaryColor" weight={300} textalign="start" whitespace="pre-wrap">
                                        {t(`app.mdpkm.common:loaders.${id}.summary`)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid spacing={8}>
                                {isLoader && <Button theme="accent" onClick={() => chooseLoader(id)} disabled={loading}>
                                    {loading && <BasicSpinner size={16}/>}
                                    {t('app.mdpkm.common:actions.continue')}
                                </Button>}
                                {isImport && <Button theme="accent" onClick={importInstance} disabled={loading}>
                                    {loading && <BasicSpinner size={16}/>}
                                    {t('app.mdpkm.select_instance_type.import.button')}
                                </Button>}
                                {!isLoader && !isImport &&
                                    <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito">
                                        {t('app.mdpkm.select_instance_type.unsupported')}
                                    </Typography>
                                }
                            </Grid>
                        </Grid>;
                    })}
                </React.Fragment>)}
            </Grid>
            <Grid width="100%" padding={16} justifyContent="space-between" css={{
                borderTop: '1px solid $tagBorder'
            }}>
                <Button theme="secondary" onClick={back} disabled={loading}>
                    <ArrowLeft size={14}/>
                    {t('app.mdpkm.common:buttons.back_to_instances')}
                </Button>
            </Grid>
        </Grid>
    );
});