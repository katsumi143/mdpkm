import React from 'react';
import hotToast from 'react-hot-toast';

import Toast from '../interface/components/Toast';
import { IMAGES } from './constants';
export function toast(title?: string, body?: string, icon?: any, duration?: number) {
    hotToast.custom(t => <Toast t={t} title={title} body={body} icon={icon}/>, {
        duration: duration ?? 10000
    });
};

export function getImage(name?: string) {
    if (!name)
        return IMAGES.placeholder;
    return IMAGES[name as keyof typeof IMAGES] ?? IMAGES.placeholder;
};