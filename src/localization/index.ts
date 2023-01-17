import i18n from 'i18next';
import { settingsSlice } from '../store/slices/settings';
import { initReactI18next } from 'react-i18next';

import enMdpkm from './locales/en-au/mdpkm.json';
import enVoxura from './locales/en-au/voxura.json';
import enInterface from './locales/en-au/interface.json';

import ruMdpkm from './locales/ru/mdpkm.json';
import ruVoxura from './locales/ru/voxura.json';
import ruInterface from './locales/ru/interface.json';

import enLOLMdpkm from './locales/en-lol/mdpkm.json';
import enLOLVoxura from './locales/en-lol/voxura.json';
import enLOLInterface from './locales/en-lol/interface.json';

await i18n
.use(initReactI18next)
.init({
	resources: {
		'en-AU': {
			mdpkm: enMdpkm,
			voxura: enVoxura,
			interface: enInterface
		},
		ru: {
			mdpkm: ruMdpkm,
			voxura: ruVoxura,
			interface: ruInterface
		},
		'en-LOL': {
			mdpkm: enLOLMdpkm,
			voxura: enLOLVoxura,
			interface: enLOLInterface
		}
	},
	lng: settingsSlice.getInitialState().language,
	fallbackLng: 'en-AU',
	interpolation: {
		escapeValue: false
	}
});