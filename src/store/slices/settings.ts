import { appDir } from '@tauri-apps/api/path';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJsonFile, writeJsonFile } from 'voxelified-commons/tauri';

type Settings = {
    theme: string,
    uiStyle: string,
    account: string,
    language: string,
    'instances.showBanner': boolean,
    'instances.modSearchPopout': boolean,
    'instances.defaultResolution': number[],
    'instances.modSearchSummaries': boolean
};
const settingsPath = `${await appDir()}/settings.json`;
const settings = await readJsonFile<Settings>(settingsPath).catch(console.warn);
export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        theme: settings?.theme ?? 'default',
        uiStyle: settings?.uiStyle ?? 'default',
        account: settings?.account,
        language: settings?.language ?? 'en',
        'instances.showBanner': settings?.['instances.showBanner'] ?? true,
        'instances.modSearchPopout': settings?.['instances.modSearchPopout'] ?? false,
        'instances.defaultResolution': settings?.['instances.defaultResolution'] ?? [900, 500],
        'instances.modSearchSummaries': settings?.['instances.modSearchSummaries'] ?? true
    },
    reducers: {
        set: (state: any, { payload: [key, value] }: PayloadAction<[keyof Settings, any]>) => {
            state[key] = value;
        },
        saveSettings: state => {
            writeJsonFile(settingsPath, state);
        }
    }
});

export const { set, saveSettings } = settingsSlice.actions;
export default settingsSlice.reducer;