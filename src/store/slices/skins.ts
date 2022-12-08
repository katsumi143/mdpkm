import { Buffer } from 'buffer';
import { createSlice } from '@reduxjs/toolkit';
import { readJsonFile, writeJsonFile } from 'voxelified-commons/tauri';

import { APP_DIR } from '../../util/constants';

const skinsPath = `${APP_DIR}/skins.json`;
const skins = await readJsonFile<any>(skinsPath).catch(console.warn);
export const skinsSlice = createSlice({
    name: 'skins',
    initialState: {
        data: skins?.data ?? [{
            name: 'Steve',
            image: await fetch('/img/skins/CLASSIC.png').then(r => r.arrayBuffer()).then(v => Buffer.from(v).toString('base64')),
            variant: 'CLASSIC'
        }, {
            name: 'Alex',
            image: await fetch('/img/skins/SLIM.png').then(r => r.arrayBuffer()).then(v => Buffer.from(v).toString('base64')),
            variant: 'SLIM'
        }]
    },
    reducers: {
        addSkin: (state, { payload }) => {
            state.data.push(payload);
        },
        saveSkins: state => {
            writeJsonFile(skinsPath, state);
        },
        writeSkin: (state, { payload: [key, data] }) => {
            state.data[key] = data;
        }
    }
});

export const { addSkin, saveSkins, writeSkin } = skinsSlice.actions;
export default skinsSlice.reducer;