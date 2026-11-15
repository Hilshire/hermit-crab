import { randomUUID } from 'crypto';
import { EntityManager, FindOptionsWhere, In, IsNull, Not } from 'typeorm';
import { Blog, Tag } from '@server/entity';
import { getRepo } from '@utils';
import type { BlogInput } from '@server/dto';

export class BlogError extends Error {
  constructor(public code: 'not-found' | 'invalid-parent' | 'invalid-tags', message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'BlogError';
  }
}

async function withTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
  const repo = await getRepo(Blog);
  if (repo.manager.connection.options.type === 'mysql') {
    return repo.manager.transaction('READ COMMITTED', operation);
  }
  return repo.manager.transaction(operation);
}

// Lock in ID order on MySQL so competing changes cannot invalidate parent checks.
async function lockBlogs(manager: EntityManager, ids: number[]) {
  if (manager.connection.options.type !== 'mysql' || ids.length === 0) return;
  const sorted = Array.from(new Set(ids)).sort((a, b) => a - b);
  await manager.getRepository(Blog).createQueryBuilder('blog')
    .where('blog.id IN (:...ids)', { ids: sorted })
    .orderBy('blog.id', 'ASC')
    .setLock('pessimistic_write')
    .getMany();
}

async function requireActive(manager: EntityManager, id: number) {
  const blog = await manager.findOneBy(Blog, { id, deletedAt: IsNull() });
  if (!blog) throw new BlogError('not-found', 'blog not found');
  return blog;
}

async function validateParent(manager: EntityManager, blog: Blog | null, parentId: number) {
  const parent = await manager.findOneBy(Blog, { id: parentId, deletedAt: IsNull() });
  if (!parent || parent.parentId || parent.id === blog?.id
    || (blog && await manager.countBy(Blog, { parentId: blog.id }))) {
    throw new BlogError('invalid-parent', '只能将没有子帖的独立文章加入主帖');
  }
}

async function getTags(manager: EntityManager, ids: number[]) {
  const tags = ids.length ? await manager.findBy(Tag, { id: In(ids) }) : [];
  if (tags.length !== ids.length) throw new BlogError('invalid-tags', 'invalid tags');
  return tags;
}

export async function createBlog(input: BlogInput) {
  return withTransaction(async (manager) => {
    if (input.parentId) {
      await lockBlogs(manager, [input.parentId]);
      await validateParent(manager, null, input.parentId);
    }
    const tags = await getTags(manager, input.tagIds);
    const blog = manager.create(Blog, {
      title: input.title,
      context: input.context,
      blogType: input.blogType,
      parentId: input.parentId || null,
      commentTerm: `hermit-crab-blog-${randomUUID()}`,
      tags,
    });
    await manager.save(blog);
  });
}

export async function updateBlog(id: number, input: BlogInput) {
  return withTransaction(async (manager) => {
    await lockBlogs(manager, [id, ...(input.parentId ? [input.parentId] : [])]);
    const blog = await requireActive(manager, id);
    if (input.parentId !== undefined && input.parentId !== blog.parentId) {
      if (input.parentId) await validateParent(manager, blog, input.parentId);
      blog.parentId = input.parentId;
    }
    const tags = await getTags(manager, input.tagIds);
    if (!blog.commentTerm) blog.commentTerm = `${blog.title} - hilshire's blog`;
    if (input.commentIssueNumber !== undefined) blog.commentIssueNumber = input.commentIssueNumber;
    blog.title = input.title;
    blog.context = input.context;
    blog.blogType = input.blogType;
    blog.tags = tags;
    await manager.save(blog);
  });
}

export async function addExistingBlog(id: number, parentId: number) {
  return withTransaction(async (manager) => {
    await lockBlogs(manager, [id, parentId]);
    const blog = await requireActive(manager, id);
    if (blog.parentId) throw new BlogError('invalid-parent', '只能将没有子帖的独立文章加入主帖');
    await validateParent(manager, blog, parentId);
    blog.parentId = parentId;
    await manager.save(blog);
  });
}

// Administrative state changes must not change the content update time.
async function setDeletedState(
  manager: EntityManager,
  criteria: FindOptionsWhere<Blog>,
  state: Pick<Blog, 'deletedAt' | 'deletedWithId'>,
) {
  await manager.createQueryBuilder().update(Blog)
    .set({ ...state, lastUpdateAt: () => 'lastUpdateAt' })
    .where(criteria).execute();
}

export async function deleteBlog(id: number) {
  return withTransaction(async (manager) => {
    await lockBlogs(manager, [id]);
    await requireActive(manager, id);
    const now = new Date();
    await setDeletedState(manager, { parentId: id, deletedAt: IsNull() },
      { deletedAt: now, deletedWithId: id });
    await setDeletedState(manager, { id }, { deletedAt: now, deletedWithId: null });
  });
}

export async function restoreBlog(id: number) {
  return withTransaction(async (manager) => {
    const initial = await manager.findOneBy(Blog, { id, deletedAt: Not(IsNull()) });
    if (!initial) throw new BlogError('not-found', 'blog not found');
    await lockBlogs(manager, [id, ...(initial.parentId ? [initial.parentId] : [])]);
    const blog = await manager.findOneBy(Blog, { id, deletedAt: Not(IsNull()) });
    if (!blog) throw new BlogError('not-found', 'blog not found');
    if (blog.parentId && !(await manager.findOneBy(Blog, { id: blog.parentId, deletedAt: IsNull() }))) {
      throw new BlogError('invalid-parent', '请先恢复主帖');
    }
    await setDeletedState(manager, { id }, { deletedAt: null, deletedWithId: null });
    await setDeletedState(manager, { deletedWithId: id }, { deletedAt: null, deletedWithId: null });
  });
}
