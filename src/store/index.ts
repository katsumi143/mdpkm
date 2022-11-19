import { useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import skinsSlice from './slices/skins';
import settingsSlice from './slices/settings';
import interfaceSlice from './slices/interface';

const store = configureStore({
    reducer: {
        skins: skinsSlice,
        settings: settingsSlice,
        interface: interfaceSlice
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;