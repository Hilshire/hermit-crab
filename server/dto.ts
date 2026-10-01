import type { Blog } from './entity';
import type Tag from './entity/Tag';

export type BlogSummary = Pick<Blog, 'id' | 'title' | 'blogType'>;
export type PublicBlogSummary = BlogSummary & { tags: Pick<TagDto, 'id' | 'name'>[] };
export type ManagedBlogSummary = BlogSummary & { tags: TagDto[] };
export type BlogDetail = Pick<Blog, 'id' | 'title' | 'context' | 'blogType' | 'createAt' | 'lastUpdateAt'> & {
  tags: TagDto[];
};
export type TagDto = Pick<Tag, 'id' | 'name' | 'color'>;

export function serializeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  throw new Error('Expected a date value from the database');
}
