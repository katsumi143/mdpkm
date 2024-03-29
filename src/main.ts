import { listen } from '@tauri-apps/api/event';
import type { UpdateManifest } from '@tauri-apps/api/updater';
import { exists, readTextFile } from '@tauri-apps/api/fs';

import './interface';
import './localization';
import store from './store';
import voxura from './voxura';
import { APP_VERSION } from './util/constants';
import { loadAllPlugins } from './plugins';
import { toast, IMAGE_EXISTS, checkForUpdate } from './util';
import { setAppUpdate, setLaunchError, setCurrentInstance, setMcServerEulaDialog } from './store/slices/interface';
import { LaunchError, InstanceTaskType, MinecraftJavaServer, MinecraftJavaClient, InstanceTaskResponse } from '../voxura';

loadAllPlugins()
.then(() => voxura.init())
.then(() => {
	voxura.instances.addTask(InstanceTaskType.PreLaunch, async instance => {
		if (instance.gameComponent.id === MinecraftJavaServer.id) {
			const path = `${instance.path}/eula.txt`;
			if (!await exists(path) || !(await readTextFile(path)).includes('eula=true')) {
				store.dispatch(setMcServerEulaDialog(instance.id));
				return InstanceTaskResponse.CancelLaunch;
			}
		} else if (instance.gameComponent.id === MinecraftJavaClient.id) {
			const account = voxura.auth.getProvider('minecraft')!.activeAccount;
			if (!account)
				throw new LaunchError('missing_account');
		}
	});
	voxura.instances.addTask(InstanceTaskType.PostLaunch, instance => {
		toast('instance_launched', [instance.displayName]);
	});
	voxura.instances.addTask(InstanceTaskType.LaunchError, (instance, error: LaunchError) => {
		store.dispatch(setLaunchError([instance.id, error.message, error.extraData]));
	});

	voxura.startInstances().then(() => {
		const instances = voxura.getInstances();
		store.dispatch(setCurrentInstance(voxura.instances.store.recent[0] || instances[0]?.id));
		
		for (const instance of instances) {
			exists(`${instance.path}/mdpkm-icon`).then(value => IMAGE_EXISTS.set(`${instance.id}-icon`, value));
			exists(`${instance.path}/mdpkm-banner`).then(value => IMAGE_EXISTS.set(`${instance.id}-banner`, value));
		}
	});
	voxura.auth.refreshProviders();
});

listen<UpdateManifest>('tauri://update-available', ({ payload }) => {
	if (payload.version !== APP_VERSION)
		store.dispatch(setAppUpdate(payload));
});

checkForUpdate();