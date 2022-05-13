export const AZURE_CLIENT_ID = "be7dfb6a-789c-4622-8c97-dcd963ae0f89";
export const AZURE_LOGIN_SCOPE = "Xboxlive.signin,Xboxlive.offline_access";

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
export const CURSEFORGE_API_BASE = "https://addons-ecs.forgesvc.net/api/v2";
export const MINECRAFT_SERVICES_API = "https://api.minecraftservices.com";

export const ESSENTIAL_SITE = "https://essential.gg";
export const MINECRAFT_NEWS_RSS = "https://www.minecraft.net/en-us/feeds/community-content/rss";

export const FORGE_MAVEN_BASE_URL = "https://maven.minecraftforge.net/net/minecraftforge/forge";

export const MINECRAFT_RESOURCES_URL = "https://resources.download.minecraft.net";
export const MINECRAFT_LIBRARIES_URL = "https://libraries.minecraft.net";

export const APINames = {
    github: 'GitHub',
    modrinth: 'Modrinth',
    internal: 'Internal',
    curseforge: 'CurseForge',
    feedthebeast: 'FeedTheBeast'
};
export const PlatformNames = {
    github: 'GitHub (n/a)',
    modrinth: 'Modrinth',
    internal: 'Internal',
    curseforge: 'CurseForge',
    feedthebeast: 'Feed the Beast'
};
export const PlatformIcons = {
    github: 'github-icon.svg',
    internal: 'img/icons/brand_default.svg',
    modrinth: 'modrinth-icon.svg',
    curseforge: 'curseforge-icon.svg',
    feedthebeast: 'ftb-icon.png'
};
export const PlatformIndex = [
    "modrinth",
    "curseforge",
    "feedthebeast",
    "internal", // not a platform!!!
    "github" // mod downloads via releases w/ updating
];
export const ModPlatforms = [
    "modrinth",
    "curseforge",
    "internal",
    "github"
];

export const LoaderNames = {
    java: 'Minecraft Java Edition',
    forge: 'Forge Loader',
    quilt: 'Quilt Loader',
    fabric: 'Fabric Loader',
    bedrock: 'Minecraft Bedrock Edition'
};
export const LoaderIcons = {
    java: 'minecraft-icon.png',
    forge: 'forge-icon.svg',
    quilt: 'quilt-icon.svg',
    fabric: 'fabric-icon.png',
    bedrock: 'bedrock-icon-small.png'
};
export const LoaderTypes = {
    java: 'java-vanilla',
    forge: 'java-modded',
    quilt: 'java-modded',
    fabric: 'java-modded',
    bedrock: 'bedrock-vanilla'
};
export const LoaderStates = {
    forge: 'Disabled',
    quilt: 'Beta Software',
    bedrock: 'Disabled'
};
export const DisabledLoaders = ['forge', 'bedrock'];

const JavaBanners = [
    [/^22w13oneblockatatime/, 'img/banners/minecraft_franchise.svg', 'One Block at a Time (April Fools)'],
    [/^20w14infinite/, 'img/banners/minecraft_franchise.svg', 'The Ultimate Content Update (April Fools)'],
    [/^3D Shareware v1\.34/, 'img/banners/minecraft_franchise.svg', '3D Shareware v1.34 (April Fools)'],
    [/^\d\.RV-.*/, 'img/banners/minecraft_franchise.svg', 'Trendy Update (April Fools)'],
    [/^15w14a/, 'img/banners/minecraft_franchise.svg', 'The Loves and Hugs Update (April Fools)'],
    [/^\d+(w\d+[a-z]|.*?-(rc|pre)\d+)/, 'img/banners/minecraft_franchise.svg', 'Minecraft Snapshot'],

    [/^1\.19/, 'img/banners/versions/minecraft_1.19.webp', 'The Wild Update'],,
    [/^1\.18/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part II'],
    [/^1\.17/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part I'],
    [/^1\.16/, 'img/banners/versions/minecraft_1.16.webp', 'The Nether Update'],
    [/^1\.16/, 'img/banners/minecraft_franchise.svg', 'Buzzy Bees'],
    [/^1\.14/, 'img/banners/versions/minecraft_1.14.webp', 'Village & Pillager'],
    [/^1\.13/, 'img/banners/versions/minecraft_1.13.webp', 'Update Aquatic'],
    [/^1\.12/, 'img/banners/minecraft_franchise.svg', 'World of Color Update'],
    [/^1\.11/, 'img/banners/minecraft_franchise.svg', 'Exploration Update'],
    [/^1\.10/, 'img/banners/minecraft_franchise.svg', 'Frostburn Update'],
    [/^1\.9/, 'img/banners/minecraft_franchise.svg', 'Cpmbat Update'],
    [/^1\.8/, 'img/banners/minecraft_franchise.svg', 'Bountiful Update'],
    [/^1\.7/, 'img/banners/minecraft_franchise.svg', 'The Update that Changed the World'],
    [/^1\.6/, 'img/banners/minecraft_franchise.svg', 'Horse Update'],
    [/^1\.5/, 'img/banners/minecraft_franchise.svg', 'Redstone Update'],
    [/^1\.4/, 'img/banners/minecraft_franchise.svg', 'Pretty Scary Update'],
    [/^1\.3/, 'img/banners/minecraft_franchise.svg', 'Minecraft Full Release'],
    [/^1\.2/, 'img/banners/minecraft_franchise.svg', 'Minecraft Full Release'],
    [/^1\.1/, 'img/banners/minecraft_franchise.svg', 'Minecraft Full Release'],
    [/^1\.0/, 'img/banners/minecraft_franchise.svg', 'Adventure Update'],

    [/^b.+/, 'img/banners/minecraft_old.webp', 'Minecraft Beta'],
    [/^a.+/, 'img/banners/minecraft_old.webp', 'Minecraft Alpha']
];
export const LoaderData = {
    java: {
        creatorIcon: 'img/icons/mojang_studios.svg',
        versionBanners: JavaBanners
    },
    forge: {
        versionBanners: JavaBanners
    },
    quilt: {
        creatorIcon: 'quilt-banner.svg',
        manifestUrl: `${QUILT_API_BASE}/versions/loader/%s/%s/profile/json`,
        versionBanners: JavaBanners
    },
    fabric: {
        manifestUrl: `${FABRIC_API_BASE}/versions/loader/%s/%s/profile/json`,
        versionBanners: JavaBanners
    },
    bedrock: {
        creatorIcon: 'img/icons/mojang_studios.svg',
        versionBanners: [
            [/1\.19/, 'img/banners/versions/minecraft_1.19.webp', 'The Wild Update'],
            [/1\.18/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part II'],
            [/1\.17/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part I']
        ]
    }
};