export default class ForgeAPI {
    static async getManifest() {
        return API.makeRequest(FORGE_VERSION_MANIFEST);
    }
};