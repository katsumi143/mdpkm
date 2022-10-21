import CheckCircle from '~icons/bi/check-circle';
import DownloadIcon from '~icons/bi/download';
import { useMemo, useState, useEffect } from 'react';

import { toast } from '../util';
import { Voxura } from '../../voxura';
import { APP_PATH } from './constants';
import type Account from '../../voxura/src/auth/account';
import type { Download } from '../../voxura/src/downloader';

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
        subscribe: (callback: any) => {
            voxura.auth.listenForEvent('accountsChanged', callback);
            return () => voxura.auth.unlistenForEvent('accountsChanged', callback);
        },
        getCurrentValue: () => voxura.auth.accounts
    }), []);
    return useSubscription(subscription);
};
export function useCurrentAccount(): Account | undefined {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => {
            voxura.auth.listenForEvent('selectedChanged', callback);
            return () => voxura.auth.unlistenForEvent('selectedChanged', callback);
        },
        getCurrentValue: () => voxura.auth.getCurrent()
    }), []);
    return useSubscription(subscription);
};

export function useInstance(id: string) {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => {
            voxura.instances.listenForEvent('listChanged', callback);
            return () => voxura.instances.unlistenForEvent('listChanged', callback);
        },
        getCurrentValue: () => voxura.getInstance(id)
    }), [id]);
    return useSubscription(subscription);
};
export function useInstances() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => {
            voxura.instances.listenForEvent('listChanged', callback);
            return () => voxura.instances.unlistenForEvent('listChanged', callback);
        },
        getCurrentValue: () => voxura.instances
    }), []);
    return useSubscription(subscription);
};

export function useDownloads() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => {
            voxura.downloader.listenForEvent('changed', callback);
            return () => voxura.downloader.unlistenForEvent('changed', callback);
        },
        getCurrentValue: () => voxura.downloader.downloads
    }), []);
    return useSubscription(subscription, true);
};

function useSubscription<T>({ subscribe, getCurrentValue }: {
    subscribe: (callback: Function) => () => void,
    getCurrentValue: () => T
}, skipCheck?: boolean): T {
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
                if (!skipCheck && prevState.value === value)
                    return prevState;

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

export { AvatarType } from '../../voxura/src/auth/account';

console.log('started voxura', voxura);
(globalThis as any).voxura = voxura;
export default voxura;