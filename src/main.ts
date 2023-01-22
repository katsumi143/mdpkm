import './interface';
import './localization';
import store from './store';
import voxura from './voxura';
import Plugins from './plugins';
import { setCurrentInstance } from './store/slices/interface';

Plugins.init()
.then(() => voxura.init())
.then(() => {
	voxura.startInstances().then(() =>
		store.dispatch(setCurrentInstance(voxura.instances.store.recent[0] || voxura.instances.getAll()[0]?.id))
	);
	voxura.auth.refreshProviders();
});