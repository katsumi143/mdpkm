import i18n from 'i18next';
import { settingsSlice } from '../common/slices/settings';
import { initReactI18next } from 'react-i18next';

await i18n
.use(initReactI18next)
.init({
    resources: {
        en: {
            'app.mdpkm.instances': (await import('./locales/en/instances')).default,
            'app.mdpkm.common': (await import('./locales/en/common')).default,
            translation: (await import('./locales/en')).default
        }
    },
    lng: settingsSlice.getInitialState().language,
    fallbackLng: 'en'
});