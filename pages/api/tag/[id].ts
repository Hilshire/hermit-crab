import type { NextApiRequest, NextApiResponse } from 'next';
import { Blog, Tag } from '@server/entity';
import { jwt } from '@middleware';
import { getRepo } from '@utils';
import { parseEntityId, parseTagInput } from '@server/validation';

const updateOrDeleteTag = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseEntityId(req.query.id);
  if (!id) return res.status(400).json({ code: 0, message: 'invalid id' });

  switch (req.method) {
    case 'PUT': {
      const input = parseTagInput(req.body);
      if (!input) return res.status(400).json({ code: 0, message: 'invalid request' });

      try {
        const tagRepo = await getRepo(Tag);
        const result = await tagRepo.update(id, input);
        if (!result.affected) return res.status(404).json({ code: 0, message: 'tag not found' });
        return res.status(200).json({ code: 1, tag: { id, ...input } });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ code: 0, message: '服务异常' });
      }
    }
    case 'DELETE': {
      try {
        const tagRepo = await getRepo(Tag);
        const tag = await tagRepo.findOneBy({ id });
        if (!tag) return res.status(404).json({ code: 0, message: 'tag not found' });

        const blogRepo = await getRepo(Blog);
        const blogs = await blogRepo.find({ relations: { tags: true } });
        await Promise.all(blogs
          .filter((blog) => blog.tags.some((blogTag) => blogTag.id === id))
          .map((blog) => blogRepo.createQueryBuilder().relation(Blog, 'tags').of(blog).remove(tag)));
        await tagRepo.remove(tag);
        return res.status(200).json({ code: 1 });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ code: 0, message: '服务异常' });
      }
    }
    default:
      res.setHeader('Allow', 'DELETE, PUT');
      return res.status(405).json({ code: 0, message: 'method not allowed' });
  }
};

export default jwt(updateOrDeleteTag);
