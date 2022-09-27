import { appDir } from '@tauri-apps/api/path';
import { createSlice } from '@reduxjs/toolkit';
import { readJsonFile, writeJsonFile } from '../../util';

const accountsPath = `${await appDir()}/accounts.json`;
const accounts = await readJsonFile(accountsPath).catch(console.warn);
export const accountsSlice = createSlice({
    name: 'accounts',
    initialState: {
        data: accounts?.data ?? [],
        selected: accounts?.selected,
        addingAccount: false
    },
    reducers: {
        addAccount: (state, { payload }) => {
            state.data.push(payload);
        },
        setAccount: (state, { payload }) => {
            state.selected = payload;
        },
        writeAccount: (state, { payload }) => {
            const index = state.data.findIndex(d => (d.profile.uuid ?? d.profile.id) === (payload.profile.uuid ?? payload.profile.id));
            if(index >= 0)
                state.data[index] = payload;
            else
                throw new Error(`Account not found`);
        },
        removeAccount: (state, { payload }) => {
            const index = state.data.findIndex(d => d.profile.uuid ?? d.profile.id === payload);
            state.data = [...state.data.slice(0, index), ...state.data.slice(index + 1)];
        },
        saveAccounts: state => {
            writeJsonFile(accountsPath, state);
        },
        setAddingAccount: (state, { payload }) => {
            state.addingAccount = payload;
        }
    }
});

export const { addAccount, setAccount, writeAccount, saveAccounts, removeAccount, setAddingAccount } = accountsSlice.actions;
export default accountsSlice.reducer;