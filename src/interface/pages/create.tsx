import { styled } from '@stitches/react';
import { squircle } from 'corner-smoothing';
import { copyFile } from '@tauri-apps/api/fs';
import { useTranslation } from 'react-i18next';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { Link, Grid, Button, TextInput, Typography, InputLabel } from 'voxeliface';

import Avatar from '../components/Avatar';
import FileSelect from '../components/FileSelect';
import WarningText from '../components/WarningText';
import VersionPicker from '../components/VersionPicker';

import voxura from '../../voxura';
import { InstanceType } from '../../../voxura';
import InstanceCreators from '../../mdpkm/instance-creator';
import { useAppDispatch } from '../../store/hooks';
import type { InstanceCreator } from '../../types';
import { InstanceCreatorOptionType } from '../../enums';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
import { getImage, IMAGE_EXISTS, getDefaultInstanceIcon } from '../../util';
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
			{Object.entries(InstanceCreators.reduce((record: Record<string, InstanceCreator[]>, creator) => {
				(record[creator.categoryId] ??= []).push(creator);
				return record;
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
			<Grid spacing={4} vertical>
				<Typography size={14} color="$secondaryColor" weight={400} family="$secondary" noSelect>
					{t('mdpkm:instance_creator.category.modpack')}
				</Typography>
				<Grid spacing={8} vertical>
					{Object.values(voxura.platforms).filter(p => p.hasModpacks).map(platform =>
						<Component id={platform.id} key={platform.id} selected={selected === platform.id} setSelected={setSelected}/>
					)}
				</Grid>
			</Grid>
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
				<Avatar src={getImage(`instance_creator.${id}`)} size="sm" layoutId={`component-img-${id}`}/>
                <Grid spacing={2} vertical justifyContent="center">
                    <StyledTitle layoutId={`component-title-${id}`}>
                        {t(`mdpkm:instance_creator.${id}`)}
                    </StyledTitle>
					<StyledSummary layout="position" layoutId={`component-summary-${id}`}>
                        {t(`mdpkm:instance_creator.${id}.summary`)}
                    </StyledSummary>
                </Grid>
            </Grid>
            <Grid height="100%" css={{
                right: 0,
                position: 'absolute'
            }}>
                <Link size={12} layout="position" padding="0 16px" onClick={() => setSelected(id)} layoutId={`component-link-${id}`}>
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
	const creator = InstanceCreators.find(c => c.id === id)!;
	const dispatch = useAppDispatch();
	const [name, setName] = useState('New Instance');
	const [icon, setIcon] = useState<string | null>(null);
	const [data, setData] = useState<Record<string, any>>({});
	const [creating, setCreating] = useState(false);
	const createInstance = async () => {
		setCreating(true);
		const instance = await voxura.instances.createInstance(name, InstanceType.Client);
		if (icon)
			await copyFile(icon, `${instance.path}/mdpkm-icon`)
				.then(() => IMAGE_EXISTS.set(`${instance.id}-banner`, true));
		await creator.execute(instance, data);

		cancel();
		dispatch(setPage('instances'));
		dispatch(setCurrentInstance(instance.id));
	};

	const iconSrc = useMemo(() => icon ? convertFileSrc(icon) : getDefaultInstanceIcon(name), [name, icon]);
	const complete = creator.options.every(o => data[o.id]);
	const nameInvalid = name.length <= 0 || name.length > 24;
	return <ComponentContainer selected layoutId={`component-${id}`}>
		<Grid width="100%" height="fit-content" css={{
			position: 'relative',
			borderBottom: '1px solid $secondaryBorder2'
		}}>
			<Grid padding={8} spacing={12}>
				<Avatar src={getImage(`instance_creator.${id}`)} size="sm" layoutId={`component-img-${id}`}/>
				<Grid spacing={2} vertical justifyContent="center">
					<StyledTitle layoutId={`component-title-${id}`}>
						{t(`mdpkm:instance_creator.${id}`)}
					</StyledTitle>
					<StyledSummary layout="position" layoutId={`component-summary-${id}`}>
						{t(`mdpkm:instance_creator.${id}.summary`)}
					</StyledSummary>
				</Grid>
			</Grid>
			<Grid height="100%" css={{
				right: 0,
				position: 'absolute'
			}}>
				<Link size={12} layout="position" padding="0 16px" onClick={cancel} disabled={creating} layoutId={`component-link-${id}`}>
					<IconBiArrowLeft/>
					{t('common.action.back')}
				</Link>
			</Grid>
		</Grid>
		<Grid height="100%" animate padding={16} vertical css={{ overflow: 'hidden' }}>
			<Grid spacing={32}>
				<Grid vertical>
					<InputLabel>{t('common.label.instance_name')}</InputLabel>
					<Grid>
						<TextInput value={name} onChange={setName}/>
						{nameInvalid && <WarningText text={t('instance_page.settings.name.invalid')} margin="6px 16px"/>}
					</Grid>
				</Grid>
				<Grid vertical>
					<InputLabel>{t('common.label.instance_icon')}</InputLabel>
					<Grid spacing={8}>
						<Avatar src={iconSrc} size="xs"/>
						<FileSelect name="Image" path={icon} setPath={setIcon} extensions={['png', 'gif']}/>
					</Grid>
				</Grid>
			</Grid>

			{creator.options.map(option => <React.Fragment key={option.id}>
				<InputLabel spaciouser>{t(`mdpkm:instance_creator.${creator.id}.option.${option.id}`)}</InputLabel>
				<CreatorOption
					data={data}
					value={data[option.id]}
					option={option}
					onChange={value => setData(data => ({ ...data, [option.id]: value }))}
				/>
			</React.Fragment>)}

			<Grid margin="auto 0 0">
				<Button theme="accent" onClick={createInstance} disabled={!complete || nameInvalid || creating}>
					<IconBiPlusLg/>
					{t('common.action.create_instance')}
				</Button>
			</Grid>
		</Grid>
	</ComponentContainer>;
}

export interface CreationOptionTypes {
	data: Record<string, any>
	value: any
	option: InstanceCreator['options'][0]
	onChange: (newValue: any) => void
}
export function CreatorOption({ data, value, option, onChange }: CreationOptionTypes) {
	if (option.type === InstanceCreatorOptionType.VersionPicker) {
		const args = option.passArguments?.map(([opt, key]) => key ? data[opt]?.[key] : data[opt]);
		if (!args || args.every(v => v))
			return <VersionPicker
				value={value}
				onChange={onChange}
				componentId={option.targetId}
				passArguments={args}
			/>;
	}
	return null;
}

const ComponentContainer = squircle(styled(motion.div, {
    display: 'flex',
    position: 'relative',
    background: '$secondaryBackground2',
    flexDirection: 'column',

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
}), {
	cornerRadius: 16,
	cornerSmoothing: 1
});

const StyledTitle = styled(motion.p, {
	color: '$primaryColor',
	margin: 0,
	fontSize: 15,
	lineHeight: 1,
	fontWeight: 450,
	fontFamily: '$primary'
});
const StyledSummary = styled(motion.p, {
	color: '$secondaryColor',
	margin: 0,
	fontSize: 12,
	lineHeight: 1,
	fontFamily: '$secondary'
});