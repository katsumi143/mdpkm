import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { readJsonFile, writeJsonFile } from 'voxelified-commons/tauri';

import joi from '../../util/joi';
import { APP_DIR, LANGUAGES } from '../../util/constants';
export interface Settings {
    theme: string
    language: string
	showNews: boolean
	startPage: 'home' | 'instances'
    instances: {
		resolution: {
			size: [number, number]
		}
	}
	developer: {
		showHiddenAuthProviders: boolean
	}
	releaseChannel: 'stable' | 'beta'
}
const settingsPath = `${APP_DIR}/settings.json`;
const settings = await readJsonFile<Settings>(settingsPath).catch(console.warn);

const releaseChannelPath = `${APP_DIR}/updater_channel`;
const releaseChannel = await readTextFile(releaseChannelPath).catch(console.warn);
export const settingsSchema = joi.object({
	theme: joi.string().default('dark'),
	showNews: joi.bool().default(true),
	language: joi.string().valid(...LANGUAGES).default('en-AU').failover('en-AU'),
	startPage: joi.string().valid('home', 'instances').default('home').failover('home'),
	instances: joi.object({
		resolution: joi.object({
			size: joi.array().items(joi.number()).default([800, 400])
		}).default().failover({
			size: [800, 400]
		})
	}).default(),
	developer: joi.object({
		showHiddenAuthProviders: joi.boolean().default(false)
	}).default(),
	releaseChannel: joi.string().valid('stable', 'beta').default('stable').failover('stable')
}).default();
export const settingsSlice = createSlice({
    name: 'settings',
	initialState: await settingsSchema.validateAsync({ ...settings, releaseChannel }, {
		stripUnknown: true
	}).catch(err => {
		console.error(err);
		return settingsSchema.validateAsync({});
	}) as Settings,
    reducers: {
        set: (state: any, { payload: [key, value] }: PayloadAction<[keyof Settings, any]>) => {
			setValue(state, value, key);
        },
        saveSettings: ({ releaseChannel, ...state }) => {
            writeJsonFile(settingsPath, state);
			writeTextFile(releaseChannelPath, releaseChannel);
        }
    }
});

function setValue(obj: any, value: any, propPath: string) {
    const [head, ...rest] = propPath.split('.');
    !rest.length ? obj[head] = value : setValue(obj[head], value, rest.join('.'));
}

export const { set, saveSettings } = settingsSlice.actions;
export default settingsSlice.reducer;