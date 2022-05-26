export default class GitHubAPI {
    static id = 'github';
    static icon = 'img/icons/platforms/github.svg';

    /*static Mods = class Mods {
        static async search() {
            return {
                hits: []
            };
        }
    }*/

    static async getProject() {
        return null;
    }

    static async getProjectVersion() {
        return null;
    }

    static async getProjectVersions() {
        return [];
    }

    static getCompatibleVersion() {
        return null;
    }
};