import { Buffer } from 'buffer/';
import { appDir } from '@tauri-apps/api/path';
import { createSlice } from '@reduxjs/toolkit';

import Util from '../util';

const skinsPath = `${await appDir()}/skins.json`;
const skins = await Util.readTextFile(skinsPath).then(JSON.parse).catch(console.warn);
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
            Util.writeFile(skinsPath, JSON.stringify(state));
        },
        writeSkin: (state, { payload: [key, data] }) => {
            state.data[key] = data;
        }
    }
});

export const { addSkin, saveSkins, writeSkin } = skinsSlice.actions;
export default skinsSlice.reducer;