import React from 'react';
import path from 'path-browserify';
import * as tauri from '@tauri-apps/api';
import { Box } from 'react-bootstrap-icons';
import { MINECRAFT_LIBRARIES_URL } from './constants';

import Image from '../components/uiblox/Image';

export default class Util {
    static formatDateBetween(date, date2, style) {
        if (style === "x-ymhs-ago") {
            let temporary;
            if (date2.getFullYear() - date.getFullYear() > 0)
                temporary = ["year", date2.getFullYear() - date.getFullYear()];
            else if (date2.getMonth() - date.getMonth() > 0)
                temporary = ["month", date2.getMonth() - date.getMonth()];
            else if (date2.getDay() - date.getDay() > 0)
                temporary = ["day", date2.getDay() - date.getDay()];
            else if (date2.getHours() - date.getHours() > 0)
                temporary = ["hour", date2.getHours() - date.getHours()];
            else if (date2.getMinutes() - date.getMinutes() > 0)
                temporary = ["minute", date2.getMinutes() - date.getMinutes()];
            else
                temporary = ["second", date2.getSeconds() - date.getSeconds()];
            return `${temporary[1]} ${temporary[0]}${temporary[1] === 1 ? '' : 's'} ago`;
        }
    }

    static async downloadFile(url, directory, useCache, fileName) {
        const split = directory.replace(/\/+|\\+/g, "/").split("/");
        if (split.reverse()[0].includes(".")) {
            fileName = split[0];
            split.shift();
        }
        directory = split.reverse().join("/");

        const outputFile = fileName ? `${directory}/${decodeURI(fileName)}` : `${directory}/${decodeURI(url.split("/").reverse()[0])}`;
        if (useCache && await Util.fileExists(outputFile))
            return outputFile;

        console.log(`Starting Download for ${url} in ${directory}`);
        const response = await new tauri.shell.Command("curl",
            [
                '-L',
                url,
                '-o',
                outputFile,
                '--create-dirs'
            ]
        ).execute();
        if (response.code !== 0)
            throw new Error(`Download Error ${response.code}`);

        console.log('Downloaded File');
        return outputFile;
    }

    static async downloadFilePath(url, path, useCache) {
        if (useCache && await Util.fileExists(path))
            return path;

        console.log(`Starting Download for ${url} as ${path}`);
        const response = await new tauri.shell.Command("curl",
            [
                '-L',
                url,
                '-o',
                path,
                '--create-dirs'
            ]
        ).execute();
        if (response.code !== 0)
            throw new Error(`Download Error ${response.code}`);

        console.log('Downloaded File');
        return path;
    }

    static async readTextFile(path) {
        try {
            return await tauri.invoke("fs_read_text_file", { path });
        } catch (err) {
            console.error(`Failed to read ${path}`);
            throw err;
        }
    }

    static async readBinaryFile(path) {
        try {
            return await tauri.invoke("fs_read_file", { path });
        } catch (err) {
            console.error(`Failed to read ${path}`);
            throw err;
        }
    }

    static writeFile(path, contents) {
        return tauri.invoke("fs_write_file", { path, contents });
    }

    static removeFile(path) {
        return tauri.invoke("fs_remove_file", { path });
    }

    static fileExists(path) {
        return tauri.invoke("fs_file_exists", { path });
    }

    static extractZip(path, outputDir) {
        return new tauri.shell.Command("tar",
            [
                '-xf',
                path,
                '-C',
                outputDir
            ]
        ).execute();
    }

    static async moveFolder(path, target) {
        return tauri.invoke("move_dir", {
            path,
            target
        }).then(_ => target);
    }

    static copyFile(path, target) {
        return tauri.invoke("fs_copy", {
            path,
            target
        }).then(_ => target);
    }

    static extractFile(path, name, output) {
        return tauri.invoke("extract_file", {
            path,
            fileName: name,
            output
        }).then(_ => output);
    }

    static extractFiles(zip, path, output, ignore) {
        return tauri.invoke("extract_files", {
            zip,
            path,
            output,
            ignore: ignore ?? "~"
        }).then(_ => output);
    }

    static createDirAll(path) {
        return tauri.invoke("fs_create_dir_all", {
            path
        }).then(_ => path);
    }

    static readDir(path) {
        return tauri.invoke("fs_read_dir", { path }).then(paths => paths.map(path => ({
            name: path.split(/\/+|\\+/).reverse()[0],
            path
        })));
    }

    static readFileInZip(path, filePath) {
        return tauri.invoke("fs_read_file_in_zip", {
            path, filePath
        });
    }

    static readBinaryInZip(path, filePath) {
        return tauri.invoke("fs_read_binary_in_zip", {
            path, filePath
        });
    }

    static createDir(path) {
        return tauri.invoke("fs_create_dir_all", { path });
    }

    static removeDir(path) {
        return tauri.invoke("fs_remove_dir", { path });
    }

    static mavenToArray(s, nativeString, forceExt) {
        const pathSplit = s.split(':');
        const fileName = pathSplit[3]
            ? `${pathSplit[2]}-${pathSplit[3]}`
            : pathSplit[2];
        const finalFileName = fileName.includes('@')
            ? fileName.replace('@', '.')
            : `${fileName}${nativeString || ''}${forceExt || '.jar'}`;
        const initPath = pathSplit[0]
            .split('.')
            .concat(pathSplit[1])
            .concat(pathSplit[2].split('@')[0])
            .concat(`${pathSplit[1]}-${finalFileName}`);
        return initPath;
    }

    static mavenToString(...args) {
        return this.mavenToArray(...args).join("/");
    }

    static binToString(array) {
        let result = "";
        for (let i = 0; i < array.length; i++) {
            result += String.fromCharCode(array[i]);
        }
        return result;
    }

    static async readJarManifest(jarPath, property) {
        const data = await this.readFileInZip(jarPath, "META-INF/MANIFEST.MF");
        console.log(data);
        for (const value of data.match(/.*:.*/g)) {
            const [prop, val] = value.split(/ *: */);
            if (prop === property)
                return val;
        }
    }

    static hiddenToken = '__HIDDEN_TOKEN__';
    static getJVMArguments(
        libraries,
        minecraftArtifact,
        instancePath,
        assetsPath,
        manifest,
        account,
        memory,
        resolution,
        hideAccessToken,
        jvmOptions = []
    ) {
        const args = [];
        args.push('-cp');

        args.push(
            [...libraries, minecraftArtifact]
                .filter(l => !l.natives)
                .map(l => `"${l.path.replace(/\/+|\\+/g, "/")}"`)
                .join(Util.platform === 'win32' ? ';' : ':')
        );

        args.push(`-Xmx${memory}m`);
        args.push(`-Xms${memory}m`);
        args.push(...jvmOptions);

        args.push(`-Djava.library.path="${instancePath}/natives"`);
        args.push(`-Dminecraft.applet.TargetDirectory="${instancePath}"`);
        if (manifest.logging)
            args.push(manifest?.logging?.client?.argument || '');

        args.push(manifest.mainClass);

        const mcArgs = manifest.minecraftArguments.split(' ');
        const argDiscovery = /\${*(.*)}/;

        for (let i = 0; i < mcArgs.length; i += 1) {
            if (argDiscovery.test(mcArgs[i])) {
                const identifier = mcArgs[i].match(argDiscovery)[1];
                let val = null;
                switch (identifier) {
                    case 'auth_player_name':
                        val = account.profile.name;
                        break;
                    case 'version_name':
                        val = manifest.id;
                        break;
                    case 'game_directory':
                        val = `"${instancePath}"`;
                        break;
                    case 'assets_root':
                        val = `"${assetsPath}"`;
                        break;
                    case 'game_assets':
                        val = `"${assetsPath}/virtual/legacy"`;
                        break;
                    case 'assets_index_name':
                        val = manifest.assets;
                        break;
                    case 'auth_uuid':
                        val = account.profile.id;
                        break;
                    case 'auth_access_token':
                        val = hideAccessToken ? this.hiddenToken : account.accessToken;
                        break;
                    case 'auth_session':
                        val = hideAccessToken ? this.hiddenToken : account.accessToken;
                        break;
                    case 'user_type':
                        val = 'mojang';
                        break;
                    case 'version_type':
                        val = manifest.type;
                        break;
                    case 'user_properties':
                        val = '{}';
                        break;
                    default:
                        break;
                }
                if (val != null) {
                    mcArgs[i] = val;
                }
            }
        }

        args.push(...mcArgs);

        if (resolution) {
            args.push(`--width ${resolution.width}`);
            args.push(`--height ${resolution.height}`);
        }

        return args;
    }

    static modernGetJVMArguments(
        libraries,
        minecraftArtifact,
        instancePath,
        assetsPath,
        manifest,
        account,
        memory,
        resolution,
        hideAccessToken,
        jvmOptions = []
    ) {
        const argDiscovery = /\${*(.*)}/;
        // eslint-disable-next-line no-template-curly-in-string
        let args = manifest.arguments.jvm.filter(value => !Util.skipLibrary(value));

        args.push(`-Xmx${memory}m`);
        args.push(`-Xms${memory}m`);
        args.push(`-Dminecraft.applet.TargetDirectory="${instancePath}"`);
        if (manifest.logging)
            args.push(manifest?.logging?.client?.argument || '');

        args.push(...jvmOptions);

        if (manifest?.forge?.arguments?.jvm)
            args.push(...manifest.forge.arguments.jvm);

        args.push(manifest.mainClass);

        args.push(...manifest.arguments.game.filter(v => !Util.skipLibrary(v)));

        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'object' && args[i].rules) {
                if (typeof args[i].value === 'string') {
                    args[i] = `"${args[i].value}"`;
                } else if (typeof args[i].value === 'object') {
                    args.splice(i, 1, ...args[i].value.map(v => `"${v}"`));
                }
                i--;
            } else if (typeof args[i] === 'string') {
                if (argDiscovery.test(args[i])) {
                    const identifier = args[i].match(argDiscovery)[1];
                    let val = null;
                    switch (identifier) {
                        case 'auth_player_name':
                            val = account.profile.name;
                            break;
                        case 'version_name':
                            val = manifest.id;
                            break;
                        case 'game_directory':
                            val = `"${instancePath}"`;
                            break;
                        case 'assets_root':
                            val = `"${assetsPath}"`;
                            break;
                        case 'assets_index_name':
                            val = manifest.assets;
                            break;
                        case 'auth_uuid':
                            val = account.profile.id;
                            break;
                        case 'auth_access_token':
                            val = hideAccessToken ? this.hiddenToken : account.accessToken;
                            break;
                        case 'user_type':
                            val = 'mojang';
                            break;
                        case 'version_type':
                            val = manifest.type;
                            break;
                        case 'resolution_width':
                            val = 800;
                            break;
                        case 'resolution_height':
                            val = 600;
                            break;
                        case 'natives_directory':
                            val = args[i].replace(
                                argDiscovery,
                                `"./natives"`
                            );
                            break;
                        case 'launcher_name':
                            val = args[i].replace(argDiscovery, 'mdpkm');
                            break;
                        case 'launcher_version':
                            val = args[i].replace(argDiscovery, '1.0');
                            break;
                        case 'classpath':
                            val = [...libraries, minecraftArtifact]
                                .filter(l => !l.natives)
                                .map(l => `"${l.path.replace(/\/+|\\+/g, "/")}"`)
                                .join(Util.platform === 'win32' ? ';' : ':');
                            break;
                        default:
                            break;
                    }
                    if (val !== null) {
                        args[i] = val;
                    }
                }
            }
        }

        if (resolution) {
            args.push(`--width ${resolution.width}`);
            args.push(`--height ${resolution.height}`);
        }
        console.log(args, Util.platform);

        args = args.filter(value => value);
        return args;
    }

    static removeDuplicates(array, property) {
        return array.filter((object, position, array) => {
            return array.map(mapping => mapping[property]).indexOf(object[property]) === position;
        });
    }

    static mapLibraries(libraries, libPath) {
        return Util.removeDuplicates(
            libraries
                .filter(value => !Util.skipLibrary(value))
                .reduce((acc, lib) => {
                    const array = [];
                    if (lib.downloads && lib.downloads.artifact) {
                        let { url } = lib.downloads.artifact;
                        if (lib.downloads.artifact.url === '') {
                            url = `https://files.minecraftforge.net/${Util.mavenToString(lib.name)}`;
                        }
                        array.push({
                            url,
                            path: path.join(libPath, lib.downloads.artifact.path),
                            sha1: lib.downloads.artifact.sha1,
                            name: lib.name
                        });
                    }

                    const native = (
                        (lib?.natives &&
                            lib?.natives[Util.convertOSMinecraft(Util.platform)]) ||
                        ''
                    ).replace(
                        '${arch}', //eslint-disable-line no-template-curly-in-string
                        '64'
                    );

                    if (native && lib?.downloads?.classifiers[native]) {
                        array.push({
                            url: lib.downloads.classifiers[native].url,
                            path: path.join(
                                libPath,
                                lib.downloads.classifiers[native].path
                            ),
                            sha1: lib.downloads.classifiers[native].sha1,
                            natives: true,
                            name: lib.name
                        });
                    }
                    if (array.length === 0) {
                        array.push({
                            url: `${lib.url || `${MINECRAFT_LIBRARIES_URL}/`}${Util.mavenToString(
                                lib.name,
                                native && `-${native}`
                            )}`,
                            path: path.join(libPath, ...Util.mavenToArray(lib.name, native)),
                            ...(native && { natives: true }),
                            name: lib.name
                        });
                    }
                    // Patch log4j versions https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228
                    // later
                    /*for (const k in array) {
                        if (array[k]?.url?.includes('log4j')) {
                            if (!array[k].url.includes('libraries.minecraft.net')) {
                                array[k] = null;
                                continue;
                            }

                            if (array[k].url.includes('2.0-beta9')) {
                                array[k] = {
                                    url: array[k].url
                                        .replace(
                                            'libraries.minecraft.net',
                                            'cdn.gdlauncher.com/maven'
                                        )
                                        .replace(/2.0-beta9/g, '2.0-beta9-fixed'),
                                    path: array[k].path.replace(/2.0-beta9/g, '2.0-beta9-fixed'),
                                    sha1: array[k].url.includes('log4j-api')
                                        ? 'b61eaf2e64d8b0277e188262a8b771bbfa1502b3'
                                        : '677991ea2d7426f76309a73739cecf609679492c',
                                    name: array[k].name
                                };
                            } else {
                                const splitName = array[k].name.split(':');
                                splitName[splitName.length - 1] = '2.15.0';
                                const patchedName = splitName.join(':');

                                array[k] = {
                                    url: `https://cdn.gdlauncher.com/maven/${mavenToArray(
                                        patchedName,
                                        native
                                    ).join(path.sep)}`,
                                    path: path.join(
                                        librariesPath,
                                        ...mavenToArray(patchedName, native)
                                    ),
                                    sha1: tempArr[k].url.includes('log4j-api')
                                        ? '42319af9991a86b4475ab3316633a3d03e2d29e1'
                                        : '9bd89149d5083a2a3ab64dcc88b0227da14152ec'
                                };
                            }
                        }
                    }*/

                    return acc.concat(array.filter(_ => _));
                }, []),
            'url'
        );
    }

    static skipLibrary(library) {
        let skip = false;
        if (library.rules) {
            skip = true;
            library.rules.forEach(({ action, os, features }) => {
                if (features)
                    return true;
                if (action === 'allow' &&
                    ((os && os.name === Util.convertOSMinecraft(Util.platform)) || !os)
                )
                    skip = false;
                if (action === 'disallow' &&
                    ((os && os.name === Util.convertOSMinecraft(Util.platform)) || !os)
                )
                    skip = true;
            });
        }
        return skip;
    }

    static convertOSMinecraft(format) {
        switch (format) {
            case 'win32':
                return 'windows';
            case 'darwin':
                return 'mac';
            case 'linux':
                return 'linux';
            default:
                return format;
        };
    }

    static tryRust() {
        return tauri.invoke("spawn");
    }

    static getInstanceIcon(instance, size) {
        size = `${size ?? "48"}px`;
        return <Image src={instance.icon ? `data:image/png;base64,${instance.icon}` : ""} background="#ffffff12" borderRadius="8.33333333%" style={{
            minWidth: size,
            minHeight: size
        }}>
            {!instance.icon && <Box size="1.4rem" color="#ffffff99"/>}
        </Image>
    }
};

Util.platform = await tauri.os.platform();