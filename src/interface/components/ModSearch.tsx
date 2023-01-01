import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, MouseEventHandler } from 'react';
import { Grid, Image, Select, Button, TextInput, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import Mod from './Mod';

import voxura from '../../voxura';
import { toast, getImage } from '../../util';
import type { Project, Instance, Mod as PlatformMod } from '../../../voxura';
export interface ModSearchProps {
	onClose?: MouseEventHandler<HTMLAnchorElement>
    instance: Instance
}
export default function ModSearch({ instance }: ModSearchProps) {
    const { t } = useTranslation('interface');

    const { store } = instance;
    const { gameComponent } = store;

    const [api, setApi] = useState('modrinth');
    const [hits, setHits] = useState(0);
    const [page, setPage] = useState(1);
    const [mods, setMods] = useState<(Project<any, any> & PlatformMod)[]>([]);
    const [query, setQuery] = useState('');
    const [pages, setPages] = useState<(string | number)[]>([]);
    const [category, setCategory] = useState('none');
    const [pageLimit, setPageLimit] = useState(20);
    const [searching, setSearching] = useState(false);
    const search = (api: string) => {
        if (searching)
            return;

        setSearching(true);
        voxura.getPlatform(api).searchMods(query, {
            limit: pageLimit,
            offset: (page - 1) * pageLimit,
            loaders: [gameComponent.id],
            versions: [gameComponent.version, gameComponent.version.substring(0, Math.max(4, gameComponent.version.lastIndexOf('.')))],
            categories: category === 'none' ? undefined : [category]
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
			toast('check_connection');
			
			throw err;
        });
    };
    useEffect(() => {
        search(api);
    }, [api, page, category, instance.id]);
	
	return <Grid width="100%" height="100%" spacing={8} vertical>
		<Grid width="100%" spacing={8} justifyContent="space-between">
			<Grid width="100%" vertical>
				<InputLabel>{t('common.label.search_query')}</InputLabel>
				<TextInput width="100%" value={query} onChange={setQuery}>
					<Button theme="secondary" onClick={() => search(api)} disabled={searching}>
						{searching ? <BasicSpinner size={16}/> : <IconBiSearch/>}
						{t('common.action.search')}
					</Button>
				</TextInput>
			</Grid>
			<Grid spacing={8}>
				<Grid vertical>
					<InputLabel>{t('common.label.category')}</InputLabel>
					<Select.Minimal value={category} onChange={setCategory} disabled={searching}>
						<Select.Group name="Categories">
							<Select.Item value="none">
								{t('app.mdpkm.mod_search.categories.none')}
							</Select.Item>
							{/*API.get(api)?.categories.filter(c => c.project_type === 'mod').map(({ name, icon }, index) =>
								<Select.Item key={index} value={name}>
									<div style={{
										width: '16px',
										color: 'var(--colors-primaryColor)',
										height: '16px'
									}} dangerouslySetInnerHTML={{ __html: icon }}/>
									{t(`app.mdpkm.mod_search.categories.${api}.${name}`)}
								</Select.Item>
							)*/}
						</Select.Group>
					</Select.Minimal>
				</Grid>
				<Grid vertical>
					<InputLabel>{t('common.label.platform')}</InputLabel>
					<Select.Minimal value={api} onChange={setApi} disabled={searching}>
						<Select.Group name="Mod Platforms">
							{Object.values(voxura.platforms).map(({ id }) =>
								<Select.Item key={id} value={id}>
									<Image src={getImage(`platform.${id}`)} size={16}/>
									{t(`voxura:platform.${id}`)}
								</Select.Item>
							)}
						</Select.Group>
					</Select.Minimal>
				</Grid>
			</Grid>
		</Grid>
		<Grid height="100%" spacing={8} vertical borderRadius={16} css={{ overflow: 'hidden auto' }}>
			{mods.map(mod => <Mod key={mod.id} data={mod} instance={instance}/>)}
			{mods.length === 0 && <Grid vertical>
				<Typography size={18}>
					{t('app.mdpkm.common:headers.empty_list')}
				</Typography>
				<Typography size={14} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
					{t('app.mdpkm.common:headers.search_retry')}
				</Typography>
			</Grid>}
		</Grid>
		<Grid width="100%" padding="0 8px" justifyContent="space-between">
			<Pagination page={page} pages={pages} setPage={setPage}/>
			<InputLabel>
				{t('mod_search.results', { count: hits })}
			</InputLabel>
		</Grid>
	</Grid>;
}

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

// TODO: move this into a separate file
export interface PaginationProps {
    page: number
    pages: (string | number)[]
    setPage: (page: number) => void
}
export function Pagination({ page, pages, setPage }: PaginationProps) {
    return <Grid spacing={4} alignItems="center">
        <StyledPage onClick={() => setPage(Math.max(page - 1, 1))}>
            <IconBiChevronLeft fontSize={10}/>
        </StyledPage>
        {pages.map(page2 =>
            typeof page2 === 'string' ?
                <Grid width={24} height={2} background="$tagBorder"/>
            : <StyledPage css={{
                color: page === page2 ? '$buttonColor' : undefined,
				userSelect: 'none',
                background: page === page2 ? '$buttonBackground' : undefined,
                pointerEvents: page === page2 ? 'none' : undefined
            }} onClick={() => setPage(page2)}>
                {page2}
            </StyledPage>
        )}
        <StyledPage onClick={() => setPage(Math.min(page + 1, pages[pages.length - 1] as number))}>
            <IconBiChevronRight fontSize={10}/>
        </StyledPage>
    </Grid>;
}