import React from 'react';
import hotToast from 'react-hot-toast';
import { Buffer } from 'buffer';
import { invoke } from '@tauri-apps/api';
import { fetch, ResponseType } from '@tauri-apps/api/http';

import Toast from '../interface/components/Toast';
import { IMAGES } from './constants';
import type { MinecraftCape, MinecraftSkin } from '../../voxura';
export function toast(id: string, data: any[] = [], icon?: any, duration?: number) {
    hotToast.custom(t => <Toast t={t} id={id} data={data} icon={icon}/>, {
        duration: duration ?? 10000
    });
}

export function getImage(name?: string) {
    if (!name)
        return IMAGES.placeholder;
    return IMAGES[name as keyof typeof IMAGES] ?? IMAGES.placeholder;
}

const DEFAULT_ICON_PATH = 'img/icons/instances/default#.svg';
export function getDefaultInstanceIcon(name?: string) {
	if (!name)
		return IMAGES.placeholder;

	let hash = 0;
    for (let i = 0; i < name.length; i++)
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = Math.abs(hash);

    if (hash % 69420 === 0)
        return DEFAULT_ICON_PATH.replace('#', '8');
	return DEFAULT_ICON_PATH.replace('#', (Math.floor(hash % 7) + 1).toString());
}

export function getDefaultInstanceBanner(name?: string) {
	if (!name)
		return IMAGES.placeholder;

	let hash = 0;
	for (let i = 0; i < name.length; i++)
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	hash = Math.abs(hash);

	return getImage('instance_banner.' + (hash % 8 + 1));
}

export function getSkinData(skin: MinecraftSkin) {
	return fetch<any[]>(skin.url.replace(/^http/, 'https'), {
		method: 'GET',
		responseType: ResponseType.Binary
	}).then(r => r.data);
}

export function getCapeData(cape: MinecraftCape) {
	return fetch<any>(cape.url.replace(/^http/, 'https'), {
		method: 'GET',
		responseType: ResponseType.Binary
	}).then(r => `data:image/png;base64,${Buffer.from(r.data).toString('base64')}`);
}

export function copyDir(path: string, target: string) {
	return invoke<string>('copy_dir', { path, target });
}

export function readTextFileInZip(path: string, target: string) {
	return invoke<string>('read_text_file_in_zip', { path, target });
}

export function readBinaryFileInZip(path: string, target: string) {
	return invoke<number[]>('read_binary_file_in_zip', { path, target });
}