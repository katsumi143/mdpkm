import { createSlice } from '@reduxjs/toolkit';

export const instancesSlice = createSlice({
    name: 'instances',
    initialState: {
        data: [],
        state: null
    },
    reducers: {
        addInstance: (state, { payload }) => {
            state.data.push(payload);
        },
        setInstance: (state, { payload: { id, data } }) => {
            state.data[state.data.findIndex(i => i.id == id)] = data;
        },
        removeInstance: (state, { payload }) => {
            const index = state.data.findIndex(i => i.id == payload);
            state.data = [...state.data.slice(0, index), ...state.data.slice(index + 1)];
        },
        clearData: (state) => {
            state.data = [];
        },
        setState: (state, { payload }) => {
            state.state = payload;
        }
    }
});

export const { setState, clearData, addInstance, setInstance, removeInstance } = instancesSlice.actions;
export default instancesSlice.reducer;