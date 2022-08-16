import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styled } from '@stitches/react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

import Mod from './Mod';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Button from '/voxeliface/components/Button';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import * as Select from '/voxeliface/components/Input/Select';
import BasicSpinner from '/voxeliface/components/BasicSpinner';

import API from '../common/api';
import Util from '../common/util';
import Patcher from '/src/common/plugins/patcher';
export default Patcher.register(function ModSearch({ instanceId }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === instanceId));

    const { config } = instance;
    const loaderData = API.getLoader(config?.loader?.type);

    const [api, setApi] = useState('modrinth');
    const [hits, setHits] = useState(0);
    const [page, setPage] = useState(1);
    const [mods, setMods] = useState([]);
    const [query, setQuery] = useState('');
    const [pages, setPages] = useState([]);
    const [category, setCategory] = useState('none');
    const [pageLimit, setPageLimit] = useState(20);
    const [searching, setSearching] = useState(false);
    const search = api => {
        if(searching)
            return toast.error('Already searching');
        if(!API.get(api).Mods) {
            setMods([]);
            return toast.error(`API.${api}.Mods is missing`);
        }
        setSearching(true);
        API.get(api).Mods.search(query, {
            limit: pageLimit,
            offset: (page - 1) * pageLimit,
            loaders: [loaderData?.asLoader ?? config.loader.type],
            versions: [config.loader.game, config.loader.game.substring(0, Math.max(4, config.loader.game.lastIndexOf('.')))],
            categories: category === 'none' ? null : [category]
        }).then(({ hits, limit, total_hits }) => {
            const pageAmount = Math.ceil(total_hits / limit);
            if(pageAmount > 4)
                if(page + 3 >= pageAmount)
                    setPages([
                        1,
                        '-',
                        pageAmount - 4,
                        pageAmount - 3,
                        pageAmount - 2,
                        pageAmount - 1,
                        pageAmount
                    ]);
                else if(page > 4)
                    setPages([
                        1,
                        '-',
                        page - 1,
                        page,
                        page + 1,
                        '-',
                        pageAmount
                    ]);
                else
                    setPages([1, 2, 3, 4, 5, '-', pageAmount]);
            else
                setPages(Array.from({ length: pageAmount }, (_, i) => i + 1));
            setMods(hits);
            setHits(total_hits);
            setSearching(false);
        }).catch(err => {
            setMods([]);
            setSearching(false);
            console.error(err);
            toast.error(`Mod Search failed!\n${err.message ?? 'Unknown Reason.'}`);
        });
    };
    useEffect(() => {
        search(api);
    }, [api, page, category, instanceId]);
    return (
        <Grid width="100%" height="100%" spacing={8} direction="vertical" css={{ overflow: 'hidden' }}>
            <Grid width="100%" spacing={8} justifyContent="space-between">
                <Grid width="100%" spacing={4} direction="vertical">
                    <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                        {t('app.mdpkm.common:labels.search_query')}
                    </Typography>
                    <TextInput width="100%" value={query} onChange={setQuery}>
                        <Button theme="secondary" onClick={() => search(api)} disabled={searching}>
                            {searching ? <BasicSpinner size={16}/> : <Search/>}
                            {t('app.mdpkm.common:actions.search')}
                        </Button>
                    </TextInput>
                </Grid>
                <Grid spacing={8}>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            {t('app.mdpkm.common:labels.category')}
                        </Typography>
                        <Select.Root value={category} onChange={setCategory} disabled={searching}>
                            <Select.Group name="Categories">
                                <Select.Item value="none">
                                    {t('app.mdpkm.mod_search.categories.none')}
                                </Select.Item>
                                {API.get(api).categories.filter(c => c.project_type === 'mod').map(({ name, icon }, index) =>
                                    <Select.Item key={index} value={name}>
                                        <div style={{
                                            width: '16px',
                                            color: 'var(--colors-primaryColor)',
                                            height: '16px'
                                        }} dangerouslySetInnerHTML={{ __html: icon }}/>
                                        {t(`app.mdpkm.mod_search.categories.${api}.${name}`)}
                                    </Select.Item>
                                )}
                            </Select.Group>
                        </Select.Root>
                    </Grid>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            {t('app.mdpkm.common:labels.platform')}
                        </Typography>
                        <Select.Root value={api} onChange={setApi} disabled={searching}>
                            <Select.Group name="Mod Platforms">
                                {API.getModPlatformIDs().map((platform, index) =>
                                    <Select.Item key={index} value={platform}>
                                        <Image src={API.get(platform).icon} size={16} borderRadius={4}/>
                                        {Util.getPlatformName(platform)}
                                    </Select.Item>
                                )}
                            </Select.Group>
                        </Select.Root>
                        {API.get(api)?.announcement && <Typography size=".6rem" color="$secondaryColor" family="Nunito" whitespace="nowrap">
                            {API.get(api).announcement}
                        </Typography>}
                    </Grid>
                </Grid>
            </Grid>
            <Grid height="100%" spacing={8} direction="vertical" borderRadius={8} css={{ overflow: 'hidden auto' }}>
                {mods.map((mod, index) => <Mod key={index} data={mod} instanceId={instanceId}/>)}
                {mods.length === 0 && <Grid direction="vertical">
                    <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                        {t('app.mdpkm.common:headers.empty_list')}
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        {t('app.mdpkm.common:headers.search_retry')}
                    </Typography>
                </Grid>}
            </Grid>
            <Grid width="100%" padding="0 8px" justifyContent="space-between">
                <Pagination page={page} pages={pages} setPage={setPage}/>
                <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito">
                    {t('app.mdpkm.mod_search.results', { val: hits })}
                </Typography>
            </Grid>
        </Grid>
    );
});

const StyledPage = styled('button', {
    width: 32,
    color: '$primaryColor',
    margin: 0,
    height: 24,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    fontSize: 12,
    alignItems: 'center',
    fontFamily: 'Nunito',
    background: '$secondaryBackground2',
    borderRadius: 24,
    justifyContent: 'center',

    '&:hover': {
        background: '$primaryBackground'
    }
});
function Pagination({ page, pages, setPage }) {
    return <Grid spacing={4} alignItems="center">
        <StyledPage onClick={() => setPage(Math.max(page - 1, 1))}>
            <ChevronLeft/>
        </StyledPage>
        {pages.map(page2 =>
            page2 === '-' ?
                <Grid width={24} height={2} background="$tagBorder"/>
            : <StyledPage css={{
                color: page === page2 && '$buttonColor',
                background: page === page2 && '$buttonBackground',
                pointerEvents: page === page2 && 'none'
            }} onClick={() => setPage(page2)}>
                {page2}
            </StyledPage>
        )}
        <StyledPage onClick={() => setPage(Math.min(page + 1, pages[pages.length - 1]))}>
            <ChevronRight/>
        </StyledPage>
    </Grid>;
};