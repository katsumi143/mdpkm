import { fetch } from '@tauri-apps/api/http';

import NewsItem from './item';
import NewsSource from './source';
export default class MinecraftNews extends NewsSource<NewsEntry> {
    public readonly id = 'minecraft';
    public async getNews(useCache = true): Promise<NewsItem<NewsEntry>[]> {
        if (useCache && this.news)
            return this.news;

        const { data } = await fetch<NewsResponse>(`${API_BASE}/news.json`);
        return this.news = data.entries.map(data => new MinecraftNewsItem(this, data));
    }

    public get displayName() {
        return 'minecraft.net';
    }
}

export const API_BASE = 'https://launchercontent.mojang.com';

export interface NewsResponse {
    version: number
	entries: NewsEntry[]
}
export interface NewsEntry {
	id: string
    tag: string
	date: string
	text: string
	title: string
	category: string
	newsType: string[]
	cardBorder: boolean
	readMoreLink: string
	playPageImage: NewsImage
	newsPageImage: NewsImage & {
		dimensions: {
			width: number,
			height: number
		}
	}
}
export interface NewsImage {
	url: string
	title: string
}
export class MinecraftNewsItem extends NewsItem<NewsEntry> {
    public get title() {
        return this.data.title;
    }

    public get image() {
        return `${API_BASE}${this.data.playPageImage.url}`;
    }

	public get url() {
		return this.data.readMoreLink;
	}
}