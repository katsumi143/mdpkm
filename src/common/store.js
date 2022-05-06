import accountsSlice from './slices/accounts';
import settingsSlice from './slices/settings';
import { configureStore } from '@reduxjs/toolkit';
export default configureStore({
    reducer: {
        accounts: accountsSlice,
        settings: settingsSlice
    }
});