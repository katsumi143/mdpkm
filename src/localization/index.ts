import i18n from 'i18next';
import { settingsSlice } from '../store/slices/settings';
import { initReactI18next } from 'react-i18next';

import enMdpkm from './locales/en/mdpkm.json';
import enVoxura from './locales/en/voxura.json';
import enInterface from './locales/en/interface.json';

await i18n
.use(initReactI18next)
.init({
    resources: {
        en: {
			mdpkm: enMdpkm,
			voxura: enVoxura,
            interface: enInterface
        }
    },
    lng: settingsSlice.getInitialState().language,
    fallbackLng: 'en'
});

const { hot } = (import.meta as any);
hot?.accept('./locales/en/interface.json', (data: any) => {
    i18n.addResourceBundle('en', 'interface', data, true, true);
});