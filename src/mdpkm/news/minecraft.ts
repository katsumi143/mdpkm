import { fetch } from '@tauri-apps/api/http';

import NewsItem from './item';
import NewsSource from './source';
export default class MinecraftNews extends NewsSource<MinecraftNewsData> {
    public readonly id = 'minecraft';
    public async getNews(useCache = true): Promise<NewsItem<MinecraftNewsData>[]> {
        if (useCache && this.news)
            return this.news;

        const { data } = await fetch<NewsResponse>('https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid?pageSize=250');

        return this.news = data.article_grid.map(data => new MinecraftNewsItem(this, data));
    }

    public get displayName() {
        return 'minecraft.net';
    }
};

type NewsResponse = {
    article_grid: MinecraftNewsData[],
    article_count: number
};
type NewsTile = {
    title: string,
    image: {
        imageURL: string
    }
};
type MinecraftNewsData = {
    default_tile: NewsTile,
    preferred_tile?: NewsTile
};
class MinecraftNewsItem extends NewsItem<MinecraftNewsData> {
    public get title() {
        return this.tile.title;
    }

    public get image() {
        return 'https://minecraft.net' + this.tile.image.imageURL;
    }

    private get tile() {
        return this.data.preferred_tile ?? this.data.default_tile;
    }
};