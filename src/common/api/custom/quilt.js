export default class QuiltAPI {
    static async getVersionManifest(game, version) {
        return API.makeRequest(`${QUILT_API_BASE}/versions/loader/${encodeURIComponent(game)}/${encodeURIComponent(version)}/profile/json`);
    }
};