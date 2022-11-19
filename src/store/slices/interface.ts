import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const interfaceSlice = createSlice({
    name: 'interface',
    initialState: {
        page: 'home',
        currentInstance: ''
    },
    reducers: {
        setPage: (state, { payload }: PayloadAction<string>) => {
            state.page = payload;
        },
        setCurrentInstance: (state, { payload }: PayloadAction<string>) => {
            state.currentInstance = payload;
        }
    }
});

export const { setPage, setCurrentInstance } = interfaceSlice.actions;
export default interfaceSlice.reducer;