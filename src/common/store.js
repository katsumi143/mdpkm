import skinsSlice from './slices/skins';
import accountsSlice from './slices/accounts';
import settingsSlice from './slices/settings';
import instancesSlice from './slices/instances';
import { configureStore } from '@reduxjs/toolkit';
export default configureStore({
    reducer: {
        skins: skinsSlice,
        accounts: accountsSlice,
        settings: settingsSlice,
        instances: instancesSlice
    }
});