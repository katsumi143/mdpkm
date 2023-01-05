import { invoke } from '@tauri-apps/api';
import Hourglass from '~icons/bi/hourglass';
import CheckSquare from '~icons/bi/check-square';
import { appDataDir } from '@tauri-apps/api/path';
import CaretRightSquare from '~icons/bi/caret-right-square';
import { getName, getVersion, getTauriVersion } from '@tauri-apps/api/app';

export const APP_DIR = await appDataDir();
export const APP_NAME = await getName();
export const APP_VERSION = await getVersion();
export const TAURI_VERSION = await getTauriVersion();

export const TOTAL_SYSTEM_MEMORY = await invoke<number>('get_total_memory');

export const PLACEHOLDER_ICON = 'img/icons/instances/default8.svg';
export const INSTANCE_STATE_ICONS = [
    CheckSquare,
    Hourglass,
    CaretRightSquare
]
export const IMAGES = {
    'placeholder': 'img/icons/instances/default8.svg',

	'component.quilt': 'img/icons/loaders/quilt.svg',
	'component.fabric': 'img/icons/loaders/fabric.png',
	'component.java-agent': 'img/icons/java-agent.svg',
	'component.java-temurin': 'img/icons/temurin.png',
	'component.minecraft-java-server': 'img/icons/minecraft/java.png',
    'component.minecraft-java-vanilla': 'img/icons/minecraft/java.png',
    'component.minecraft-bedrock-vanilla': 'img/icons/minecraft/bedrock.png',
	'component.minecraft-java-server-paper': 'img/icons/component/paper.svg',

	'platform.modrinth': 'img/icons/platform/modrinth.svg',
	'platform.curseforge': 'img/icons/platform/curseforge.svg',
	'platform.feedthebeast': 'img/icons/platform/feedthebeast.png',

	'instance_banner.1': 'img/banners/instances/banner1_1.png',
	'instance_banner.2': 'img/banners/instances/banner2.png',
	'instance_banner.3': 'img/banners/instances/banner3.png',

	'download.temurin': 'img/icons/temurin.png',
	'download.minecraft_java': 'img/icons/minecraft/java.png'
}