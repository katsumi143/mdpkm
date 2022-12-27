import './interface';
import './localization';
import voxura from './voxura';
import Plugins from './plugins';

Plugins.init()
.then(() => voxura.init())
.then(() => {
	voxura.startInstances();
	voxura.auth.loadFromFile().then(() => voxura.auth.refreshAccounts());
});