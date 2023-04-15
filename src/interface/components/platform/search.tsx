import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import React, { useRef, useMemo, useEffect, useState, MouseEventHandler } from 'react';
import { Grid, Image, Select, Button, TextInput, Typography, InputLabel, BasicSpinner } from 'voxeliface';

import ListItem from './project';

import voxura from '../../../voxura';
import { i, toast } from '../../../util';
import { useAppSelector } from '../../../store/hooks';
import { Project, Instance, ProjectType } from '../../../../voxura';
export interface PlatformSearchProps {
	onClose?: MouseEventHandler<HTMLAnchorElement>
    instance: Instance
}
export default function PlatformSearch({ instance }: PlatformSearchProps) {
    const { store } = instance;
    const { components, gameComponent } = store;

	const { t } = useTranslation('interface');
	const container = useRef<HTMLDivElement>(null);
	const projectType = useAppSelector(state => state.interface.searchType);
    const [api, setApi] = useState('modrinth');
    const [hits, setHits] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [pages, setPages] = useState<(string | number)[]>([]);
	const [items, setItems] = useState<Project<any>[]>([]);
    const [pageLimit, setPageLimit] = useState(20);
    const [searching, setSearching] = useState(false);
	const platform = useMemo(() => voxura.getPlatform(api), [api]);
    const search = () => {
        if (searching)
            return;

        setSearching(true);
        platform.search(query, projectType, {
            limit: pageLimit,
            offset: (page - 1) * pageLimit,
            loaders: projectType === ProjectType.Mod ? components.map(l => l.getIdForPlatform(platform)).filter(c => c) as any : undefined,
            versions: [gameComponent.version, gameComponent.version.substring(0, Math.max(4, gameComponent.version.lastIndexOf('.')))]
        }).then(({ hits, limit, total }) => {
            const pageAmount = Math.ceil(total / limit);
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
            setHits(total);
			setItems(hits);
            setSearching(false);
        }).catch(err => {
            setItems([]);
            setSearching(false);
			toast('check_connection');
			
			throw err;
        });
    };
    useEffect(() => {
        search();
    }, [api, page, instance.id]);
	useEffect(() => {
		container.current?.scroll(0, 0);
	}, [searching]);
	
	return <Grid width="100%" height="100%" spacing={8} vertical>
		<Grid width="100%" spacing={8} justifyContent="space-between">
			<Grid width="100%" vertical>
				<InputLabel>{t('common.label.search_query')}</InputLabel>
				<TextInput width="100%" value={query} onChange={setQuery}>
					<Button theme="secondary" onClick={search} disabled={searching}>
						{searching ? <BasicSpinner size={16}/> : <IconBiSearch/>}
						{t('common.action.search')}
					</Button>
				</TextInput>
			</Grid>
			<Grid width="40%" vertical>
				<InputLabel>{t('common.label.platform')}</InputLabel>
				<Select.Minimal value={api} onChange={setApi} disabled={searching}>
					<Select.Group name={t('common.label.platforms')}>
						{Object.values(voxura.platforms).map(({ id }) =>
							<Select.Item key={id} value={id}>
								<Image src={i(`platform.${id}`)} size={16}/>
								{t(`voxura:platform.${id}`)}
							</Select.Item>
						)}
					</Select.Group>
				</Select.Minimal>
			</Grid>
		</Grid>
		<Grid ref={container} height="100%" spacing={8} vertical borderRadius={16} css={{ overflow: 'hidden auto' }}>
			{items.map(item => <ListItem key={item.id} data={item} instance={instance}/>)}
			{items.length === 0 && <Grid vertical>
				<Typography color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
					{t('common.label.search_no_results')}
				</Typography>
			</Grid>}
		</Grid>
		<Grid width="100%" padding="0 8px" justifyContent="space-between">
			<Pagination page={page} pages={pages} setPage={setPage}/>
			<InputLabel>
				{t('platform_search.results', { count: hits })}
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
    fontFamily: '$primary',
    background: '$secondaryBackground2',
    borderRadius: 24,
    justifyContent: 'center',

    variants: {
		disabled: {
			true: {
				cursor: 'not-allowed',
				opacity: .5
			},
			false: {
				'&:hover': {
					background: '$primaryBackground'
				}
			}
		}
	},
	defaultVariants: { disabled: false }
});

// TODO: move this into a separate file
export interface PaginationProps {
    page: number
    pages: (string | number)[]
    setPage: (page: number) => void
}
export function Pagination({ page, pages, setPage }: PaginationProps) {
    return <Grid spacing={4} alignItems="center">
        <StyledPage onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1}>
            <IconBiChevronLeft fontSize={10}/>
        </StyledPage>
        {pages.map(page2 =>
            typeof page2 === 'string' ?
                <Grid width={24} height={2} background="$tagBorder"/>
            : <StyledPage key={page2} css={{
                color: page === page2 ? '$buttonColor' : undefined,
				userSelect: 'none',
                background: page === page2 ? '$buttonBackground' : undefined,
                pointerEvents: page === page2 ? 'none' : undefined
            }} onClick={() => setPage(page2)}>
                {page2}
            </StyledPage>
        )}
        <StyledPage onClick={() => setPage(Math.min(page + 1, pages[pages.length - 1] as number))} disabled={page === pages[pages.length - 1]}>
            <IconBiChevronRight fontSize={10}/>
        </StyledPage>
    </Grid>;
}