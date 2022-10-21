import React from 'react';
import hotToast from 'react-hot-toast';
import { FsOptions, writeFile, readTextFile } from '@tauri-apps/api/fs';

import Toast from '../components/Toast';
export function toast(title?: string, body?: string, icon?: any, duration?: number) {
    hotToast.custom(t => <Toast t={t} title={title} body={body} icon={icon}/>, {
        duration: duration ?? 10000
    });
};

export function readJsonFile<T>(filePath: string, options?: FsOptions): Promise<T> {
    return readTextFile(filePath, options).then(JSON.parse);
};

export function writeJsonFile(filePath: string, contents: any, options?: FsOptions): Promise<void> {
    return writeFile(filePath, JSON.stringify(contents), options);
};