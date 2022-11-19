import CheckCircle from '~icons/bi/check-circle';
import DownloadIcon from '~icons/bi/download';
import { useMemo, useState, useEffect } from 'react';

import { toast } from './util';
import { Voxura } from '../voxura';
import { APP_PATH } from './common/constants';
import type Account from '../voxura/src/auth/account';
import type { Download } from '../voxura/src/downloader';
import VersionedComponent from '../voxura/src/instances/component/versioned-component';
import type { ComponentVersions } from '../voxura/src/types';

const voxura = new Voxura(APP_PATH);
await voxura.startInstances();
await voxura.auth.loadFromFile();
await voxura.auth.refreshAccounts();

voxura.downloader.listenForEvent('downloadStarted', (download: Download) => {
    if (download.visible)
        toast('Download Started', download.displayName, DownloadIcon);
});
voxura.downloader.listenForEvent('downloadFinished', (download: Download) => {
    if (download.visible)
        toast('Download Finished', download.displayName, CheckCircle);
})

export function useAccounts(): Account[] {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.auth.listenForEvent('accountsChanged', callback),
        getCurrentValue: () => voxura.auth.accounts
    }), []);
    return useSubscription(subscription);
};
export function useCurrentAccount(): Account | undefined {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.auth.listenForEvent('selectedChanged', callback),
        getCurrentValue: () => voxura.auth.getCurrent()
    }), []);
    return useSubscription(subscription);
};

export function useInstance(id: string) {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => {
            const instance = voxura.getInstance(id);
            if (instance)
                return instance.listenForEvent('changed', callback);
            return voxura.instances.listenForEvent('listChanged', callback);
        },
        getCurrentValue: () => voxura.getInstance(id)
    }), [id]);
    return useSubscription(subscription);
};
export function useInstances() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.instances.listenForEvent('listChanged', callback),
        getCurrentValue: () => voxura.instances.getAll()
    }), []);
    return useSubscription(subscription);
};
export function useRecentInstances() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.instances.listenForEvent('changed', callback),
        getCurrentValue: () => voxura.instances.getRecent()
    }), []);
    return useSubscription(subscription);
};

export function useDownloads() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.downloader.listenForEvent('changed', callback),
        getCurrentValue: () => voxura.downloader.downloads
    }), []);
    return useSubscription(subscription);
};

export function useComponentVersions(component: VersionedComponent | typeof VersionedComponent) {
    const [value, setValue] = useState<ComponentVersions | null>(null);
    useEffect(() => {
        setValue(null);
        component.getVersions().then(setValue);
    }, []);
    return value;
};

function useSubscription<T>({ subscribe, getCurrentValue }: {
    subscribe: (callback: Function) => () => void,
    getCurrentValue: () => T
}): T {
    const [state, setState] = useState(() => ({
        getCurrentValue,
        subscribe,
        value: getCurrentValue(),
    }));

    let valueToReturn = state.value;
    if (state.getCurrentValue !== getCurrentValue || state.subscribe !== subscribe) {
        valueToReturn = getCurrentValue();

        setState({
            getCurrentValue,
            subscribe,
            value: valueToReturn,
        });
    }

    useEffect(() => {
        let didUnsubscribe = false;
        const checkForUpdates = () => {
            if (didUnsubscribe)
                return;
            setState(prevState => {
                if (prevState.getCurrentValue !== getCurrentValue || prevState.subscribe !== subscribe)
                    return prevState;
                const value = getCurrentValue();
                /*if (prevState.value === value)
                    return prevState;*/

                return { ...prevState, value };
            });
        };
        const unsubscribe = subscribe(checkForUpdates);
        checkForUpdates();

        return () => {
            didUnsubscribe = true;
            unsubscribe();
        };
    }, [getCurrentValue, subscribe]);
    return valueToReturn;
}

export * from '../voxura';
export { AvatarType } from '../voxura/src/auth/account';

console.log('started voxura', voxura);
(globalThis as any).voxura = voxura;
export default voxura;