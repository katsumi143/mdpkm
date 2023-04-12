import { invoke } from '@tauri-apps/api';
import Hourglass from '~icons/bi/hourglass';
import CheckSquare from '~icons/bi/check-square';
import { appDataDir } from '@tauri-apps/api/path';
import CaretRightSquare from '~icons/bi/caret-right-square';
import { getName, getTauriVersion } from '@tauri-apps/api/app';

import { version } from '../../package.json';
export const APP_DIR = await appDataDir();
export const APP_NAME = await getName();
export const APP_VERSION = version;
export const TAURI_VERSION = await getTauriVersion();

export const TOTAL_SYSTEM_MEMORY = await invoke<number>('get_total_memory');

export const PLACEHOLDER_IMAGE = 'img/icon/instance/default8.svg';
export const INSTANCE_STATE_ICONS = [
    CheckSquare,
    Hourglass,
    CaretRightSquare
]
export const IMAGES = {
	header: 'img/banner/brand_text.svg',
	app_icon: 'img/icon/brand_default.svg',
    placeholder: PLACEHOLDER_IMAGE,

	'component.quilt': 'img/icon/component/minecraft-quilt.svg',
	'component.fabric': 'img/icon/component/minecraft-fabric.svg',
	'component.modrinth': 'img/icon/platform/modrinth.svg',
	'component.java-agent': 'img/icon/component/java-agent.svg',
	'component.java-temurin': 'img/icon/component/java-temurin.png',
	'component.minecraft-java-server': 'img/icon/minecraft/java.png',
    'component.minecraft-java-vanilla': 'img/icon/minecraft/java.png',
    'component.minecraft-bedrock-vanilla': 'img/icon/minecraft/bedrock.png',
	'component.minecraft-java-server-paper': 'img/icon/component/minecraft-paper.svg',

	'platform.modrinth': 'img/icon/platform/modrinth.svg',
	'platform.curseforge': 'img/icon/platform/curseforge.svg',
	'platform.feedthebeast': 'img/icon/platform/feedthebeast.png',

	'instance_banner.1': 'img/banner/instance/banner1_1.webp',
	'instance_banner.2': 'img/banner/instance/banner2.webp',
	'instance_banner.3': 'img/banner/instance/banner3.webp',
	'instance_banner.4': 'img/banner/instance/banner4.webp',
	'instance_banner.5': 'img/banner/instance/banner5.webp',
	'instance_banner.6': 'img/banner/instance/banner6.webp',
	'instance_banner.7': 'img/banner/instance/banner7.webp',
	'instance_banner.8': 'img/banner/instance/banner8.webp',

	'auth_provider.minecraft': 'img/banner/auth_platform/microsoft.svg',

	unknown_pack: 'img/icon/minecraft/unknown_pack.png',
	unknown_server: 'img/icon/minecraft/unknown_server.png',

	'download.temurin': 'img/icon/temurin.png',
	'download.minecraft_java': 'img/icon/minecraft/java.png'
}

export const LANGUAGES = ['en-AU', 'lv', 'ru', 'en-LOL']

export const SITE_BASE = 'https://mdpkm-site.vercel.app';
export const PUBLIC_SITE_BASE = 'https://mdpkm.voxelified.com';