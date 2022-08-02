import { getName, getVersion, getTauriVersion } from '@tauri-apps/api/app';

export const APP_NAME = await getName();
export const APP_VERSION = await getVersion();
export const TAURI_VERSION = await getTauriVersion();

export const AZURE_CLIENT_ID = "be7dfb6a-789c-4622-8c97-dcd963ae0f89";
export const AZURE_LOGIN_SCOPE = "Xboxlive.signin,Xboxlive.offline_access";
export const CURSEFORGE_CORE_KEY = "$2a$10$jDvu9Kjp7bMAQqFEXz3/luw3vZoweBrgcDhyW5HwNung.wuaXeTji";

export const FORGE_VERSION_MANIFEST = "https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json";
export const MINECRAFT_VERSION_MANIFEST = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

export const MICROSOFT_LOGIN_URL = "https://login.live.com/oauth20_authorize.srf";

export const SKIN_API_BASE = "https://visage.surgeplay.com";
export const QUILT_API_BASE = "https://meta.quiltmc.org/v3";
export const FABRIC_API_BASE = "https://meta.fabricmc.net/v2";
export const MOJANG_API_BASE = "https://authserver.mojang.com";

export const MDPKM_API = "https://mdpkm.voxelified.com/api";
export const FTB_API_BASE = "https://api.modpacks.ch";
export const ADOPTIUM_API = "https://api.adoptium.net/v3";
export const ESSENTIAL_BASE = "https://cdn.essential.gg/mods";
export const XBOX_AUTH_BASE = "https://user.auth.xboxlive.com";
export const XSTS_AUTH_BASE = "https://xsts.auth.xboxlive.com";
export const MODRINTH_API_BASE = "https://api.modrinth.com/v2";
export const CURSEFORGE_API_BASE = "https://api.curseforge.com/v1";
export const MINECRAFT_SERVICES_API = "https://api.minecraftservices.com";

export const ESSENTIAL_SITE = "https://essential.gg";
export const MINECRAFT_NEWS_RSS = "https://www.minecraft.net/en-us/feeds/community-content/rss";

export const FORGE_MAVEN_BASE_URL = "https://maven.minecraftforge.net/net/minecraftforge/forge";

export const MINECRAFT_RESOURCES_URL = "https://resources.download.minecraft.net";
export const MINECRAFT_LIBRARIES_URL = "https://libraries.minecraft.net";

export const LoaderStates = {
    forge: 'Unstable',
    quilt: 'Beta Software',
    bedrock: 'Unstable'
};
export const DisabledLoaders = [];