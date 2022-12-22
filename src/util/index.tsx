import React from 'react';
import hotToast from 'react-hot-toast';

import Toast from '../interface/components/Toast';
import { IMAGES } from './constants';
export function toast(title?: string | null, body?: string | null, icon?: any, duration?: number) {
    hotToast.custom(t => <Toast t={t} title={title ?? ''} body={body ?? ''} icon={icon}/>, {
        duration: duration ?? 10000
    });
};

export function getImage(name?: string) {
    if (!name)
        return IMAGES.placeholder;
    return IMAGES[name as keyof typeof IMAGES] ?? IMAGES.placeholder;
};

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

	return getImage('instance_banner.' + (hash % 3 + 1));
};