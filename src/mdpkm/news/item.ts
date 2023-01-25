import type NewsSource from './source';
export default abstract class NewsItem<T> {
    public source: NewsSource<T>;
    protected data: T;
    public constructor(source: NewsSource<T>, data: T) {
        this.source = source;
        this.data = data;
    }

    public abstract get title(): string
    public abstract get image(): string
	public get authors(): string[] {
		return [];
	}
	public get tags(): string[] {
		return [];
	}
	public abstract get url(): string
}