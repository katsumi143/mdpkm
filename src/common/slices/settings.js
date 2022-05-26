import Util from '../util';
import { appDir } from '@tauri-apps/api/path';
import { createSlice } from '@reduxjs/toolkit';

const settingsPath = `${await appDir()}/settings.json`;
const settings = await Util.readTextFile(settingsPath).then(JSON.parse).catch(console.warn);
export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        theme: settings?.theme ?? 'default',
        account: settings?.account,
        language: settings?.language ?? 'en'
    },
    reducers: {
        setTheme: (state, { payload }) => {
            state.theme = payload;
        },
        setAccount: (state, { payload }) => {
            state.account = payload;
        },
        setLanguage: (state, { payload }) => {
            state.language = payload;
        },
        saveSettings: state => {
            Util.writeFile(settingsPath, JSON.stringify(state));
        }
    }
});

export const { setTheme, setAccount, setLanguage, saveSettings } = settingsSlice.actions;
export default settingsSlice.reducer;