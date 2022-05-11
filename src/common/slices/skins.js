import Util from '../util';
import { appDir } from '@tauri-apps/api/path';
import { createSlice } from '@reduxjs/toolkit';

const skinsPath = `${await appDir()}/skins.json`;
const skins = await Util.readTextFile(skinsPath).then(JSON.parse).catch(console.warn);
export const skinsSlice = createSlice({
    name: 'skins',
    initialState: {
        data: skins?.data ?? {}
    },
    reducers: {
        addSkin: (state, { payload }) => {
            state.data[payload.id] = payload.data;
        },
        saveSkins: state => {
            Util.writeFile(skinsPath, JSON.stringify(state));
        },
        writeSkin: (state, { payload }) => {
            for (const [id, data] of Object.entries(state.data)) {
                const index = data.findIndex(d => d.id === payload);
                if(index >= 0)
                    state.data[id][index] = payload;
            }
        }
    }
});

export const { addSkin, saveSkins, writeSkin } = skinsSlice.actions;
export default skinsSlice.reducer;