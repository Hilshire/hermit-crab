import { IsNull } from 'typeorm';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { randomUUID } from 'crypto';
import { parseBlogInput } from '@server/validation';
import { Blog, Tag } from '../../../server/entity';

const createBlog = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
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
        if (input.parentId) {
          const parent = await repo.findOneBy({ id: input.parentId, deletedAt: IsNull() });
          if (!parent || parent.parentId) return res.status(400).json({ code: 0, message: 'invalid parent' });
        }
        const blog = repo.create({
          title: input.title,
          context: input.context,
          blogType: input.blogType,
          tags,
          parentId: input.parentId || null,
          commentTerm: `hermit-crab-blog-${randomUUID()}`,
        });
        await repo.save(blog);
        res.status(200).json({ code: 1 });
      } catch (e) {
        console.error(e);
        res.status(500).json({ code: 0, message: '服务异常' });
      }
      break;
    }
    default:
      res.setHeader('Allow', 'PUT');
      return res.status(405).json({ code: 0, message: 'method not allowed' });
  }
};

export default jwt(createBlog);
