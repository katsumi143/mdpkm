export default class GitHubAPI {
    static SOURCE_NUMBER = 4;

    static Mods = class Mods {
        static async search() {
            return {
                hits: []
            };
        }
    }

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