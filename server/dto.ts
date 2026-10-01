import type { Blog } from './entity';
import type Tag from './entity/Tag';

export type BlogSummary = Pick<Blog, 'id' | 'title' | 'blogType'>;
export type BlogDetail = Pick<Blog, 'id' | 'title' | 'context' | 'blogType' | 'createAt' | 'lastUpdateAt'> & {
  tags: TagDto[];
};
export type TagDto = Pick<Tag, 'id' | 'name' | 'color'>;
