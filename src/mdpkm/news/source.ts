import type NewsItem from './item';
export default abstract class NewsSource<T> {
    public readonly abstract id: string;
    protected news?: NewsItem<T>[];
    public constructor() {

    }

    public abstract getNews(): Promise<NewsItem<T>[]>
    public abstract get displayName(): string
};