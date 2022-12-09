import { Buffer } from 'buffer';
import { invoke } from '@tauri-apps/api';

// this is planned to be fully removed
export default class Util {
    static async readFileBase64(path) {
        const binary = await this.readBinaryFile(path);
        return Buffer.from(binary).toString('base64');
    }

    static async readFileInZipBase64(path, filePath) {
        const binary = await this.readBinaryInZip(path, filePath);
        return Buffer.from(binary).toString('base64');
    }

    static async moveFolder(path, target) {
        return invoke('move_dir', {
            path,
            target
        }).then(_ => target).catch(err => {throw new Error(`moveFolder failed: ${err}`)});
    }

    static createDirAll(path) {
        return invoke('fs_create_dir_all', {
            path
        }).then(_ => path).catch(err => {throw new Error(`createDirAll failed: ${err}`)});
    }

    static readDir(path) {
        return invoke('fs_read_dir', { path }).then(paths => paths.map(([path, isDir]) => ({
            name: path.split(/\/+|\\+/).reverse()[0],
            path,
            isDir: isDir === 'true'
        }))).catch(err => {throw new Error(`readDir failed: ${err}`)});
    }

    static readDirRecursive(path) {
        return invoke('fs_read_dir_recursive', { path }).then(paths => paths.map(([path, isDir]) => ({
            name: path.split(/\/+|\\+/).reverse()[0],
            path,
            isDir: isDir === 'true'
        }))).catch(err => {throw new Error(`readDirRecursive failed: ${err}`)});
    }

    static readFileInZip(path, filePath) {
        return invoke('fs_read_file_in_zip', {
            path, filePath
        }).catch(err => {throw new Error(`readFileInZip failed: ${err}`)});
    }
};