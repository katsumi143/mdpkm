import { fetch } from '@tauri-apps/api/http';

import NewsItem from './item';
import NewsSource from './source';
import { SITE_BASE, PUBLIC_SITE_BASE } from '../../util/constants';
export default class mdpkmNews extends NewsSource<mdpkmNewsEntry> {
    public readonly id: string = 'mdpkm';
    public async getNews(useCache = true): Promise<NewsItem<mdpkmNewsEntry>[]> {
        if (useCache && this.news)
            return this.news;

        const { data } = await fetch<mdpkmNewsResponse>(`${SITE_BASE}/feed.json`);
        return this.news = data.items.map(data => new mdpkmNewsItem(this, data));
    }
}

export interface mdpkmNewsResponse {
    title: string
	items: mdpkmNewsEntry[]
	version: string
	language: string
}
export interface mdpkmNewsEntry {
	url: string
	tags: NewsTag[]
	title: string
	body?: string
	authors: string[]
	thumbnail_url: string
}
export type NewsTag = 'release'
export class mdpkmNewsItem extends NewsItem<mdpkmNewsEntry> {
    public get title() {
        return this.data.title;
    }

	public get rawBody() {
		return this.data.body;
	}

    public get image() {
        return `${SITE_BASE}${this.data.thumbnail_url}`;
    }

	public get authors() {
		return this.data.authors;
	}
	public get tags() {
		return this.data.tags;
	}

	public get url() {
		return `${PUBLIC_SITE_BASE}${this.data.url}`;
	}
}