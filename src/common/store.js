import skinsSlice from './slices/skins';
import accountsSlice from './slices/accounts';
import settingsSlice from './slices/settings';
import { configureStore } from '@reduxjs/toolkit';
export default configureStore({
    reducer: {
        skins: skinsSlice,
        accounts: accountsSlice,
        settings: settingsSlice
    }
});