import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ProjectType } from '../../../voxura';
import { Settings, settingsSlice } from './settings';
export const interfaceSlice = createSlice({
    name: 'interface',
    initialState: {
        page: settingsSlice.getInitialState().startPage,
		contentTab: 0,
		searchType: ProjectType.Mod,
		instanceTab: 0,
		launchError: null as [string, string, any[] | undefined] | null,
        currentInstance: ''
    },
    reducers: {
        setPage: (state, { payload }: PayloadAction<Settings["startPage"]>) => {
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
        }
    }
});

export const { setPage, setContentTab, setSearchType, setLaunchError, setInstanceTab, setCurrentInstance } = interfaceSlice.actions;
export default interfaceSlice.reducer;