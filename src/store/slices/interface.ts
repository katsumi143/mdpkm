import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ProjectType } from '../../../voxura';
import { settingsSlice } from './settings';
import type { Instance } from '../../../voxura';
export const interfaceSlice = createSlice({
    name: 'interface',
    initialState: {
        page: settingsSlice.getInitialState().startPage as string,
		contentTab: 0,
		searchType: ProjectType.Mod,
		instanceTab: 0,
		launchError: null as [string, string, any[] | undefined] | null,
        currentInstance: '',
		mcServerEulaDialog: null as string | null
    },
    reducers: {
        setPage: (state, { payload }: PayloadAction<string>) => {
            state.page = payload;
        },
		setContentTab: (state, { payload }: PayloadAction<number>) => {
			state.contentTab = payload;
		},
		setSearchType: (state, { payload }: PayloadAction<ProjectType>) => {
			state.searchType = payload;
		},
		setLaunchError: (state, { payload }: PayloadAction<[string, string, any[] | undefined] | null>) => {
			state.launchError = payload;
		},
		setInstanceTab: (state, { payload }: PayloadAction<number>) => {
			state.instanceTab = payload;
		},
        setCurrentInstance: (state, { payload }: PayloadAction<string>) => {
            state.currentInstance = payload;
        },
		setMcServerEulaDialog: (state, { payload }: PayloadAction<string | null>) => {
			state.mcServerEulaDialog = payload;
		}
    }
});

export const { setPage, setContentTab, setSearchType, setLaunchError, setInstanceTab, setCurrentInstance, setMcServerEulaDialog } = interfaceSlice.actions;
export default interfaceSlice.reducer;