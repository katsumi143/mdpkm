import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TabItem, Typography } from 'voxeliface';

import Tabs from '../Tabs';
import Project from '../platform/project';
import ModManagement from '../ModManagement';

import voxura from '../../../voxura';
import { setContentTab } from '../../../store/slices/interface';
import { Instance, InstanceState } from '../../../../voxura';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { ComponentExtra, COMPONENT_EXTRAS } from '../../../mdpkm';
export interface ContentProps {
    instance: Instance
}
export default function Content({ instance }: ContentProps) {
	const tab = useAppSelector(state => state.interface.contentTab);
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();

	const extras: [ComponentExtra, string][] = instance.store.components.map(c => [COMPONENT_EXTRAS[c.id], c.id]);
	const useEssential = extras.some(([e]) => e?.enabledContentTabs?.includes('essential'));
	const useModManagement = extras.some(([e]) => e?.enabledContentTabs?.includes('modManagement'));
    const setTab = (value: number) => dispatch(setContentTab(value));

	let tabCount = 0;
	return <React.Fragment>
		<Tabs
			value={tab}
			onChange={setTab}
			borderRadius={0}
			css={{
				height: '100%',
				border: 'none',
				willChange: 'contents'
			}}
		>
			<TabItem name={t('mod_management')} icon={<IconBiList/>} value={0} disabled={!useModManagement}>
				<ModManagement instance={instance}/>
			</TabItem>
			<TabItem name={t('essential')} icon={<EssentialIcon/>} value={1} spacing={4} disabled={!useEssential}>
				<Grid alignItems="end" justifyContent="space-between">
					<EssentialBanner/>
					{instance.state !== InstanceState.None &&
						<Typography size={12} color="#ffba64" noSelect>
							<IconBiExclamationTriangleFill/>
							{t('mod_management.warning')}
						</Typography>
					}
				</Grid>
				<Typography size={12} color="$secondaryColor" margin="0 0 8px" weight={400} family="$secondary" noSelect textalign="start">
					Essential is a quality of life mod that boosts Minecraft Java to the next level.
				</Typography>
				<Project id="essential-container" platform={voxura.getPlatform('mdpkm')} instance={instance}/>
			</TabItem>
			{extras.map(extra => extra[0]?.contentTabs?.map((ContentTab, key) =>
				<TabItem key={key} name={t(`voxura:component.${extra[1]}.content_tab.${key}`)} icon={<IconBiList fontSize={11}/>} value={3 + tabCount++}>
					<ContentTab instance={instance}/>
				</TabItem>
			)).flat().filter(x => x)}
		</Tabs>
	</React.Fragment>;
}

export function EssentialIcon() {
	return <svg width="14" height="14" viewBox="0 0 8 8">
		<path d="M0 4L4 0L8 4L4 8L0 4Z" fill="currentColor"/>
	</svg>;
}

export function EssentialBanner() {
	return <svg width="1266" height="183" viewBox="0 0 1266 183" xmlns="http://www.w3.org/2000/svg" style={{
		width: 'fit-content',
		height: '2rem',
		margin: '.15rem 0 0'
	}}>
		<path fill="var(--colors-primaryColor)" d="M267.221 66.13H190.341L187.086 83.955H260.556L256.061 107.05H182.436L178.406 127.355H256.836L252.031 152H139.501L160.891 41.33H272.026L267.221 66.13ZM364.761 74.655C365.174 69.7983 363.418 66.3367 359.491 64.27C355.668 62.1 349.881 61.015 342.131 61.015C332.624 61.015 325.908 62.6167 321.981 65.82C319.501 67.99 318.261 70.4183 318.261 73.105C318.261 75.3783 319.191 77.0317 321.051 78.065C323.014 79.0983 326.063 79.8733 330.196 80.39L367.086 84.575C377.213 85.7117 385.066 88.605 390.646 93.255C396.329 97.905 399.171 104.415 399.171 112.785C399.171 117.952 398.034 123.377 395.761 129.06C393.488 134.64 389.871 139.342 384.911 143.165C379.538 147.298 372.614 150.398 364.141 152.465C355.668 154.635 343.578 155.72 327.871 155.72C308.031 155.72 292.944 153.188 282.611 148.125C272.381 142.958 267.266 134.175 267.266 121.775C267.266 119.605 267.421 117.383 267.731 115.11H306.636L306.481 117.59C306.481 123.067 308.548 126.787 312.681 128.75C316.814 130.713 322.963 131.695 331.126 131.695C341.873 131.695 349.364 130.145 353.601 127.045C355.358 125.805 356.546 124.41 357.166 122.86C357.889 121.31 358.251 119.967 358.251 118.83C358.251 116.04 357.114 113.973 354.841 112.63C352.568 111.287 349.158 110.305 344.611 109.685L311.286 105.655C289.483 102.968 278.581 93.875 278.581 78.375C278.581 73.5183 279.563 68.765 281.526 64.115C283.593 59.3617 286.589 55.2283 290.516 51.715C295.786 47.1683 302.658 43.7067 311.131 41.33C319.604 38.85 330.919 37.61 345.076 37.61C384.136 37.61 403.666 48.3567 403.666 69.85C403.666 70.78 403.563 72.3817 403.356 74.655H364.761ZM503.262 74.655C503.675 69.7983 501.919 66.3367 497.992 64.27C494.169 62.1 488.382 61.015 480.632 61.015C471.125 61.015 464.409 62.6167 460.482 65.82C458.002 67.99 456.762 70.4183 456.762 73.105C456.762 75.3783 457.692 77.0317 459.552 78.065C461.515 79.0983 464.564 79.8733 468.697 80.39L505.587 84.575C515.714 85.7117 523.567 88.605 529.147 93.255C534.83 97.905 537.672 104.415 537.672 112.785C537.672 117.952 536.535 123.377 534.262 129.06C531.989 134.64 528.372 139.342 523.412 143.165C518.039 147.298 511.115 150.398 502.642 152.465C494.169 154.635 482.079 155.72 466.372 155.72C446.532 155.72 431.445 153.188 421.112 148.125C410.882 142.958 405.767 134.175 405.767 121.775C405.767 119.605 405.922 117.383 406.232 115.11H445.137L444.982 117.59C444.982 123.067 447.049 126.787 451.182 128.75C455.315 130.713 461.464 131.695 469.627 131.695C480.374 131.695 487.865 130.145 492.102 127.045C493.859 125.805 495.047 124.41 495.667 122.86C496.39 121.31 496.752 119.967 496.752 118.83C496.752 116.04 495.615 113.973 493.342 112.63C491.069 111.287 487.659 110.305 483.112 109.685L449.787 105.655C427.984 102.968 417.082 93.875 417.082 78.375C417.082 73.5183 418.064 68.765 420.027 64.115C422.094 59.3617 425.09 55.2283 429.017 51.715C434.287 47.1683 441.159 43.7067 449.632 41.33C458.105 38.85 469.42 37.61 483.577 37.61C522.637 37.61 542.167 48.3567 542.167 69.85C542.167 70.78 542.064 72.3817 541.857 74.655H503.262ZM671.523 66.13H594.643L591.388 83.955H664.858L660.363 107.05H586.738L582.708 127.355H661.138L656.333 152H543.803L565.193 41.33H676.328L671.523 66.13ZM774.333 110.15L787.508 41.33H820.213L798.668 152H761.313L718.223 82.095H717.293L703.808 152H671.103L692.648 41.33H730.933L773.403 110.15H774.333ZM831.93 41.33H952.365L947.25 68.145H904.16L887.885 152H853.63L869.905 68.145H826.815L831.93 41.33ZM998.758 41.33L977.213 152H942.958L964.503 41.33H998.758ZM1134.39 152H1098.58L1093.78 133.71H1035.65L1024.18 152H985.433L1058.59 41.33H1103.23L1134.39 152ZM1076.11 69.85L1051.15 109.375H1087.27L1077.04 69.85H1076.11ZM1258.71 125.495L1253.6 152H1142.46L1163.85 41.33H1198.11L1181.99 125.495H1258.71Z"/>
		<rect fill="var(--colors-primaryColor)" x="56.5684" y="40" width="80" height="80" transform="rotate(45 56.5684 40)"/>
	</svg>;
}