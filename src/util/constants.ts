import Hourglass from '~icons/bi/hourglass';
import CheckSquare from '~icons/bi/check-square';
import { appDataDir } from '@tauri-apps/api/path';
import CaretRightSquare from '~icons/bi/caret-right-square';
import { getName, getVersion } from '@tauri-apps/api/app';

export const APP_DIR = await appDataDir();
export const APP_NAME = await getName();
export const APP_VERSION = await getVersion();

export const PLACEHOLDER_ICON = 'img/icons/instances/default8.svg';
export const INSTANCE_STATE_ICONS = [
    CheckSquare,
    Hourglass,
    CaretRightSquare
];
export const IMAGES = {
    'placeholder': 'img/icons/instances/default8.svg',

    'component.minecraft-java-vanilla': 'img/icons/minecraft/java.png',
    'component.minecraft-bedrock-vanilla': 'img/icons/minecraft/bedrock.png',
    'component.fabric': 'img/icons/loaders/fabric.png',
    'component.quilt': 'img/icons/loaders/quilt.svg',

	'instance_banner.1': 'img/banners/instances/banner1_1.png',
	'instance_banner.2': 'img/banners/instances/banner2.png',
	'instance_banner.3': 'img/banners/instances/banner3.png'
};