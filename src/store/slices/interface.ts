import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const interfaceSlice = createSlice({
    name: 'interface',
    initialState: {
        page: 'home',
		instanceTab: 0,
		launchError: null as [string, string, any[] | undefined] | null,
        currentInstance: ''
    },
    reducers: {
        setPage: (state, { payload }: PayloadAction<string>) => {
            state.page = payload;
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

export const { setPage, setLaunchError, setInstanceTab, setCurrentInstance } = interfaceSlice.actions;
export default interfaceSlice.reducer;