import Hourglass from '~icons/bi/hourglass';
import { appDir } from '@tauri-apps/api/path';
import CheckSquare from '~icons/bi/check-square';
import CaretRightSquare from '~icons/bi/caret-right-square';
import { getName, getVersion } from '@tauri-apps/api/app';

export const APP_DIR = await appDir();
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
    'component.quilt': 'img/icons/loaders/quilt.svg'
};