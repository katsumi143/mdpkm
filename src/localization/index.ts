import i18n from 'i18next';
import { settingsSlice } from '../store/slices/settings';
import { initReactI18next } from 'react-i18next';

await i18n
.use(initReactI18next)
.init({
    resources: {
        en: {
            'app.mdpkm.instances': (await import('./locales/en/instances.json')).default,
            'app.mdpkm.common': (await import('./locales/en/common.json')).default,
            translation: (await import('./locales/en/index.json')).default,
            interface: (await import('./locales/en/interface.json')).default,
            voxura: (await import('./locales/en/voxura.json')).default,
			mdpkm: (await import('./locales/en/mdpkm.json')).default
        },
        lv: {
            'app.mdpkm.instances': (await import('./locales/lv/instances.json')).default,
            'app.mdpkm.common': (await import('./locales/lv/common.json')).default,
            translation: (await import('./locales/lv/index.json')).default
        }
    },
    lng: settingsSlice.getInitialState().language,
    fallbackLng: 'en'
});