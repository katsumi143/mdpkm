import i18n from 'i18next';
import { settingsSlice } from '../store/slices/settings';
import { initReactI18next } from 'react-i18next';

import enMdpkm from './locales/en/mdpkm.json';
import enVoxura from './locales/en/voxura.json';
import enInterface from './locales/en/interface.json';

import ruMdpkm from './locales/ru/mdpkm.json';
import ruVoxura from './locales/ru/voxura.json';
import ruInterface from './locales/ru/interface.json';

await i18n
.use(initReactI18next)
.init({
	resources: {
		en: {
			mdpkm: enMdpkm,
			voxura: enVoxura,
			interface: enInterface
		},
		ru: {
			mdpkm: ruMdpkm,
			voxura: ruVoxura,
			interface: ruInterface
		}
	},
	lng: settingsSlice.getInitialState().language,
	fallbackLng: 'en'
});