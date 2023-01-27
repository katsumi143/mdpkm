import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Grid, Button, Typography } from 'voxeliface';

import Avatar from '../components/Avatar';

import { getImage } from '../../util';
import InstanceCreator from '../../mdpkm/instance-creator';
import { useAppDispatch } from '../../store/hooks';
import { INSTANCE_CREATORS } from '../../mdpkm';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
export default function Create() {
    const { t } = useTranslation('interface');
    const dispatch = useAppDispatch();
    const [selected, setSelected] = useState<string | null>(null);
    const changePage = (page: string) => dispatch(setPage(page));
    return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical>
        <Typography size={20} noSelect>
            {t('create_instance')}
        </Typography>
        <Link size={12} onClick={() => changePage('instances')}>
            <IconBiArrowLeft/>
            {t('common.action.return_to_instances')}
        </Link>
		<Grid height="100%" margin="16px 0 0" vertical spacing={16} css={{ position: 'relative' }}>
			{Object.entries(INSTANCE_CREATORS.reduce((acc: Record<string, InstanceCreator[]>, val) => {
				const { category } = val;
				if (!acc[category])
					acc[category] = [];

				acc[category].push(val);
				return acc;
			}, {})).map(([category, creators]) =>
				<Grid key={category} spacing={4} vertical>
					<Typography size={14} color="$secondaryColor" weight={400} family="$secondary" noSelect>
						{t(`mdpkm:instance_creator.category.${category}`)}
					</Typography>
					<Grid spacing={8} vertical>
						{creators.map(creator =>
							<Component id={creator.id} key={creator.id} selected={selected === creator.id} setSelected={setSelected}/>
						)}
					</Grid>
				</Grid>
			)}
		</Grid>
    </Grid>;
}

// TODO: move into a separate file
export interface ComponentProps {
    id: string
    selected: boolean
    setSelected: (value: string | null) => void
}
export function Component({ id, selected, setSelected }: ComponentProps) {
    const { t } = useTranslation('interface');
    return <React.Fragment>
        <ComponentContainer layoutId={`component-${id}`}>
            <Grid height="fit-content" padding={8} spacing={12}>
				<Avatar src={getImage(`component.${id}`)} size="sm" layoutId={`component-img-${id}`}/>
                <Grid spacing={4} vertical justifyContent="center">
                    <Typography noFlex layout="position" noSelect layoutId={`component-title-${id}`} lineheight={1}>
                        {t(`voxura:component.${id}`)}
                    </Typography>
					<Typography size={12} color="$secondaryColor" noFlex weight={400} layout="position" family="$secondary" noSelect layoutId={`component-summary-${id}`} lineheight={1}>
                        {t(`voxura:component.${id}.summary`)}
                    </Typography>
                </Grid>
            </Grid>
            <Grid height="100%" layoutId={`component-link-${id}`} css={{
                right: 0,
                position: 'absolute'
            }}>
                <Link size={12} padding="0 16px" onClick={() => setSelected(id)}>
                    {t('common.action.continue')}
                    <IconBiArrowRight/>
                </Link>
            </Grid>
        </ComponentContainer>
        <AnimatePresence>
            {selected && <Setup id={id} cancel={() => setSelected(null)}/>}
        </AnimatePresence>
    </React.Fragment>;
}

export interface SetupProps {
    id: string
    cancel: () => void
}
export function Setup({ id, cancel }: SetupProps) {
    const { t } = useTranslation('interface');
    const creator = INSTANCE_CREATORS.find(c => c.id === id);
    const dispatch = useAppDispatch();
    const [data, setData] = useState<any[]>([]);
    const [creating, setCreating] = useState(false);
    const [satisfied, setSatisfied] = useState(false);
    const createInstance = async() => {
        setCreating(true);
        const instance = await creator!.create(data);

        cancel();
        dispatch(setPage('instances'));
        dispatch(setCurrentInstance(instance.id));
    };
    if (!creator)
        throw new Error();

	const { ReactComponent } = creator;
    return <ComponentContainer selected layoutId={`component-${id}`}>
        <Grid width="100%" height="fit-content" css={{
            position: 'relative',
            borderBottom: '1px solid $secondaryBorder2'
        }}>
            <Grid padding={8} spacing={12}>
				<Avatar src={getImage(`component.${id}`)} size="sm" layoutId={`component-img-${id}`}/>
            	<Grid spacing={4} vertical justifyContent="center">
                    <Typography noFlex layout="position" noSelect layoutId={`component-title-${id}`} lineheight={1}>
                        {t(`voxura:component.${id}`)}
                    </Typography>
					<Typography size={12} color="$secondaryColor" noFlex weight={400} layout="position" family="$secondary" noSelect layoutId={`component-summary-${id}`} lineheight={1}>
                        {t(`voxura:component.${id}.summary`)}
                    </Typography>
                </Grid>
            </Grid>
            <Grid height="100%" layoutId={`component-link-${id}`} css={{
                right: 0,
                position: 'absolute'
            }}>
                <Link size={12} padding="0 16px" onClick={cancel} disabled={creating}>
                    <IconBiArrowLeft/>
                    {t('common.action.back')}
                </Link>
            </Grid>
        </Grid>
        <Grid height="100%" animate padding={16} css={{
            overflow: 'hidden',
            position: 'relative'
        }}>
            {<ReactComponent creator={creator} setData={setData} setSatisfied={setSatisfied}/>}
            <Grid css={{
                bottom: 16,
                position: 'absolute'
            }}>
                <Button theme="accent" onClick={createInstance} disabled={!satisfied || creating}>
                    <IconBiPlusLg/>
                    {t('common.action.create_instance')}
                </Button>
            </Grid>
        </Grid>
    </ComponentContainer>;
}

const ComponentContainer = styled(motion.div, {
    border: 'transparent solid 1px',
    display: 'flex',
    position: 'relative',
    background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
    flexDirection: 'column',
	'--squircle-smooth': 1,
	'--squircle-radius': 16,
	'-webkit-mask-image': 'paint(squircle)',

    variants: {
        selected: {
            true: {
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 2,
                height: '100%',
                position: 'absolute'
            }
        }
    }
});