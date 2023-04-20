import hotToast from 'react-hot-toast';
import { decode } from 'nbt-ts';
import { Buffer } from 'buffer';
import { invoke } from '@tauri-apps/api';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { exists, readBinaryFile } from '@tauri-apps/api/fs';
import React, { useState, useEffect } from 'react';

import Toast from '../interface/components/Toast';
import { IMAGES } from './constants';
import type { Instance, MinecraftCape, MinecraftSkin } from '../../voxura';
export function toast(id: string, data: any[] = [], icon?: any, duration?: number) {
    hotToast.custom(t => <Toast t={t} id={id} data={data} icon={icon}/>, {
        duration: duration ?? 10000
    });
}

export function getImage(name?: string): string {
    if (!name)
        return IMAGES.placeholder;
    return (IMAGES[name as keyof typeof IMAGES] ?? IMAGES.placeholder).replace(/\$\((.*?)\)/g, (_,name) => getImage(name));
}
export const i = getImage;

export const IMAGE_EXISTS = new Map<string, boolean>();
export function getInstanceIcon(instance: Instance) {
	return getInstanceImage(instance, 'icon', getDefaultInstanceIcon);
}
export function getInstanceBanner(instance: Instance) {
	return getInstanceImage(instance, 'banner', getDefaultInstanceBanner);
}
export function getInstanceImage(instance: Instance, name: string, getDefault: (name: string) => string): [string, boolean] {
	const exists = IMAGE_EXISTS.get(`${instance.id}-${name}`) ?? false;
	return [exists ? convertFileSrc(`${instance.path}/mdpkm-${name}`) : getDefault(instance.name), exists];
}

const DEFAULT_ICON_PATH = 'img/icon/instance/default#.svg';
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

interface NbtString {
	type: 'string'
	value: string
}
export interface MinecraftServer {
	ip?: NbtString
	name?: NbtString
	icon?: NbtString
}
export function useMinecraftServers(instance: Instance) {
	const path = instance.path + '/servers.dat';
	const [value, setValue] = useState<MinecraftServer[] | null>(null);
	useEffect(() => {
		exists(path).then(exists => {
			if (exists)
				readBinaryFile(path).then(data => {
					const decoded: any = decode(Buffer.from(data));
					setValue(decoded.value.servers);
				});
			else
				setValue([]);
		});
	}, []);

	return value;
}

export function useDayString(date?: number) {
    const { t } = useTranslation('interface');
    if (typeof(date) !== 'number')
        return t('common.date.never');
    
    const difference = Date.now() - date;
    const days = Math.floor(difference / (1000 * 3600 * 24));
    if (days === 0)
        return t('common.date.today');
    if (days === 1)
        return t('common.date.yesterday');
    return t('common.date.days_ago', [days]);
}
export function useTimeString(date?: number) {
    const { t } = useTranslation('interface');
    if (typeof(date) !== 'number')
        return t('common.date.never');
    
	const hours = Math.round(date / 3600000);
	const minutes = Math.round(date / 60000);
	const seconds = Math.round(date / 1000);
	if (Math.abs(hours) > 0)
		return t('common.time.hours', { count: hours });
	else if (Math.abs(minutes) > 0)
		return t('common.time.minutes', { count: minutes });
    return t('common.time.seconds', { count: seconds });
}

export function prettifySemver(value: string, t: TFunction) {
	return value.replace(/-beta\.(\d+)/g, (_,v) => t('semver.beta', [v]))
		.replace(/\+(\d+)/g, (_,v) => t('semver.build', [v]));
}