import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJsonFile, writeJsonFile } from 'voxelified-commons/tauri';

import joi from '../../util/joi';
import { APP_DIR, LANGUAGES } from '../../util/constants';
export interface Settings {
    theme: string
    language: string
	showNews: boolean
    instances: {
		resolution: [number, number]
	}
}
const settingsPath = `${APP_DIR}/settings.json`;
const settings = await readJsonFile<Settings>(settingsPath).catch(console.warn);
export const settingsSlice = createSlice({
    name: 'settings',
	initialState: await joi.object({
		theme: joi.string().default('dark'),
		showNews: joi.bool().default(true),
		language: joi.string().valid(...LANGUAGES).default('en-AU').failover('en-AU'),
		startPage: joi.string().valid('home', 'instances').default('home'),
		instances: joi.object({
			resolution: joi.array().items(joi.number()).default([800, 400])
		}).default({
			resolution: [800, 400]
		})
	}).validateAsync(settings, {
		stripUnknown: true
	}),
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