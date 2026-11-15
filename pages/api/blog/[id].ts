import type { NextApiRequest, NextApiResponse } from 'next';
import { IsNull } from 'typeorm';
import { Blog, Tag } from '@server/entity';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { parseBlogInput, parseEntityId } from '@server/validation';

const deleteOrPutBlog = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseEntityId(req.query.id);
  if (!id) {
    return res.status(400).json({ code: 0, message: 'invalid id' });
  }

  switch (req.method) {
    case 'DELETE':
      try {
        const repo = await getRepo(Blog);
        const blog = await repo.findOneBy({ id, deletedAt: IsNull() });
        if (!blog) return res.status(404).json({ code: 0, message: 'blog not found' });
        await repo.manager.transaction(async (manager) => {
          const now = new Date();
          await manager.update(Blog, { parentId: id, deletedAt: IsNull() },
            { deletedAt: now, deletedWithId: id });
          await manager.update(Blog, { id }, { deletedAt: now, deletedWithId: null });
        });
        res.status(200).json({ code: 1 });
      } catch (e) {
        console.error(e);
        res.status(500).json({ code: 0, message: '服务异常' });
      }
      break;
    case 'PATCH':
    {
      const parentId = typeof req.body?.parentId === 'number' ? req.body.parentId : null;
      if (!parentId || !Number.isSafeInteger(parentId) || parentId <= 0 || parentId === id) {
        return res.status(400).json({ code: 0, message: '无效的主帖' });
      }
      try {
        const repo = await getRepo(Blog);
        const blog = await repo.findOneBy({ id, deletedAt: IsNull() });
        const parent = await repo.findOneBy({ id: parentId, deletedAt: IsNull() });
        if (!blog || blog.parentId || !parent || parent.parentId
          || await repo.countBy({ parentId: id })) {
          return res.status(400).json({ code: 0, message: '只能将没有子帖的独立文章加入主帖' });
        }
        blog.parentId = parentId;
        await repo.save(blog);
        return res.status(200).json({ code: 1 });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ code: 0, message: '服务异常' });
      }
    }
    case 'PUT':
    {
      const input = parseBlogInput(req.body);
      if (!input) {
        return res.status(400).json({ code: 0, message: 'invalid request' });
      }

      try {
        const repo = await getRepo(Blog);
        const tagRepo = await getRepo(Tag);
        const tags = input.tagIds.length ? await tagRepo.findByIds(input.tagIds) : [];
        if (tags.length !== input.tagIds.length) {
          return res.status(400).json({ code: 0, message: 'invalid tags' });
        }
        const blog = await repo.findOneBy({ id });
        if (!blog) {
          return res.status(404).json({ code: 0, message: 'blog not found' });
        }
        if (blog.deletedAt) return res.status(404).json({ code: 0, message: 'blog not found' });
        if (input.parentId !== undefined && input.parentId !== blog.parentId) {
          if (input.parentId) {
            const parent = await repo.findOneBy({ id: input.parentId, deletedAt: IsNull() });
            const children = await repo.countBy({ parentId: id });
            if (!parent || parent.parentId || parent.id === id || children) {
              return res.status(400).json({ code: 0, message: 'invalid parent' });
            }
          }
          blog.parentId = input.parentId;
        }
        if (!blog.commentTerm) blog.commentTerm = `${blog.title} - hilshire's blog`;
        if (input.commentIssueNumber !== undefined) {
          blog.commentIssueNumber = input.commentIssueNumber;
        }
        blog.title = input.title;
        blog.context = input.context;
        blog.blogType = input.blogType;
        blog.tags = tags;
        await repo.save(blog);
        res.status(200).json({ code: 1 });
      } catch (e) {
        console.error(e);
        res.status(500).json({ code: 0, message: '服务异常' });
      }
      break;
    }
    default:
      res.setHeader('Allow', 'DELETE, PATCH, PUT');
      return res.status(405).json({ code: 0, message: 'method not allowed' });
  }
};

export default jwt(deleteOrPutBlog);
