import Util from '../util';
import { appDir } from '@tauri-apps/api/path';
import { createSlice } from '@reduxjs/toolkit';

const accountsPath = `${await appDir()}/accounts.json`;
const accounts = await Util.readTextFile(accountsPath).then(JSON.parse).catch(console.warn);
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
            const index = state.data.findIndex(d => d.profile.uuid === payload.profile.uuid);
            if(index >= 0)
                state.data[index] = payload;
        },
        saveAccounts: state => {
            Util.writeFile(accountsPath, JSON.stringify(state));
        },
        setAddingAccount: (state, { payload }) => {
            state.addingAccount = payload;
        }
    }
});

export const { addAccount, setAccount, writeAccount, saveAccounts, setAddingAccount } = accountsSlice.actions;
export default accountsSlice.reducer;