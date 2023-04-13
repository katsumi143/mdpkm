import { exists, readTextFile } from '@tauri-apps/api/fs';

import './interface';
import './localization';
import store from './store';
import voxura from './voxura';
import Plugins from './plugins';
import { setCurrentInstance, setMcServerEulaDialog } from './store/slices/interface';
import { InstanceTaskType, MinecraftJavaServer, InstanceTaskResponse } from '../voxura';

Plugins.init()
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
	voxura.startInstances().then(() =>
		store.dispatch(setCurrentInstance(voxura.instances.store.recent[0] || voxura.instances.getAll()[0]?.id))
	);
	voxura.auth.refreshProviders();
});