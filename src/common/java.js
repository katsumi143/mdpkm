import { arch } from '@tauri-apps/api/os';

import API from './api';
import Util from './util';
import { ADOPTIUM_API } from './constants';
import DataController from './dataController';

export default class Java {
    constructor(dataController, dataPath, data) {
        this.dataController = dataController;
        this.path = dataPath;
        this.data = data;
    }

    static async build() {
        const dataPath = `${DataController.dataPath}/java`;
        if(!await Util.fileExists(dataPath))
            await Util.createDir(dataPath);
        return new Java(DataController, dataPath, await DataController.getData('javaData'));
    }

    async getExecutable(version, updateToastState) {
        const latest = await Util.readDir(this.path).then(files => files.map(f => f.name).filter(f => f.startsWith(`jdk-${version}`) || f.startsWith(`jdk${version}`)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))).reverse()[0]);
        if(!latest)
            return this.downloadJDK(version, updateToastState);
        return `${this.path}/${latest}/bin/java.exe`;
    }

    async downloadJDK(version, updateToastState) {
        updateToastState(`Downloading OpenJDK ${version} (will take a while)`);

        const arc = await arch();
        const versions = await API.makeRequest(`${ADOPTIUM_API}/assets/latest/${version}/hotspot?vendor=eclipse`);
        const latest = versions.find(({ binary }) =>
            binary.os === { win32: 'windows' }[Util.platform] &&
            binary.image_type === 'jdk' &&
            binary.architecture === this.convertArch(arc)
        );

        const zipPath = await Util.downloadFile(latest.binary.package.link, `${this.dataController.dataPath}/temp`);
        await Util.extractZip(zipPath, `${this.path}`);

        return `${this.path}/${latest.release_name}/bin/javaw.exe`;
    }

    convertArch(arch) {
        return {
            'x86_64': 'x64',
            'x86': 'x32'
        }[arch];
    }

    getVersions() {
        return this.data.get('installed');
    }
}