export default class Project {
    constructor(data, source) {
        this.data = data;
        this.source = source;

        this.id = data.project_id ?? data.id;
        this.slug = data.slug;
        this.icon = data.icon_url ?? data.logo?.url ?? data.art?.find(a => a.type === 'square')?.url;
        this.type = data.project_type;
        this.title = data.title ?? data.name ?? this.slug;
        this.author = data.author ?? data.authors?.[0]?.name;
        this.website = data.website_url;
        this.summary = data.synopsis ?? data.description ?? data.summary;
        this.downloads = data.downloads ?? data.downloadCount ?? data.installs;
    }
};