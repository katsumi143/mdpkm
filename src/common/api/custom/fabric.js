export default class FabricAPI {
    static async getVersionManifest(game, version) {
        return API.makeRequest(`${FABRIC_API_BASE}/versions/loader/${encodeURIComponent(game)}/${encodeURIComponent(version)}/profile/json`);
    }
};