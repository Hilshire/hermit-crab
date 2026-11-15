import type { Blog } from './entity';
import type Tag from './entity/Tag';
import type { BlogType } from './entity/type';

export interface BlogInput {
  title: string;
  context: string;
  blogType: BlogType;
  tagIds: number[];
  parentId?: number | null;
  commentIssueNumber?: number | null;
}

export type BlogSummary = Pick<Blog, 'id' | 'title' | 'blogType'>;
export type PublicBlogSummary = BlogSummary & { tags: Pick<TagDto, 'id' | 'name'>[]; latest?: { title: string; date: string } | null };
export type ManagedBlogSummary = BlogSummary & {
  tags: TagDto[]; parentId?: number | null; deletedAt?: string | null;
};
export type BlogDetail = Pick<Blog, 'id' | 'title' | 'context' | 'blogType' | 'createAt' | 'lastUpdateAt'> & {
  tags: TagDto[];
  parentId?: number | null;
  commentTerm?: string | null;
  commentIssueNumber?: number | null;
};
export type TagDto = Pick<Tag, 'id' | 'name' | 'color'>;

export function serializeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  throw new Error('Expected a date value from the database');
}

export function serializeBlogDetail(blog: Blog): BlogDetail {
  return {
    id: blog.id,
    title: blog.title,
    context: blog.context,
    blogType: blog.blogType,
    createAt: serializeDate(blog.createAt),
    lastUpdateAt: serializeDate(blog.lastUpdateAt),
    parentId: blog.parentId,
    commentTerm: blog.commentTerm,
    commentIssueNumber: blog.commentIssueNumber,
    tags: (blog.tags || []).map(({ id, name, color }) => ({ id, name, color })),
  };
}
