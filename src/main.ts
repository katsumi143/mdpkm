import { exists, readTextFile } from '@tauri-apps/api/fs';

import './interface';
import './localization';
import store from './store';
import voxura from './voxura';
import { toast } from './util';
import { loadAllPlugins } from './plugins';
import { setLaunchError, setCurrentInstance, setMcServerEulaDialog } from './store/slices/interface';
import { LaunchError, InstanceTaskType, MinecraftJavaServer, InstanceTaskResponse } from '../voxura';

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
		}
	});
	voxura.instances.addTask(InstanceTaskType.PostLaunch, instance => {
		toast('instance_launched', [instance.name]);
	});
	voxura.instances.addTask(InstanceTaskType.LaunchError, (instance, error: LaunchError) => {
		store.dispatch(setLaunchError([instance.id, error.message, error.extraData]));
	});

	voxura.startInstances().then(() =>
		store.dispatch(setCurrentInstance(voxura.instances.store.recent[0] || voxura.instances.getAll()[0]?.id))
	);
	voxura.auth.refreshProviders();
});