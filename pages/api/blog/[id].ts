import type { NextApiRequest, NextApiResponse } from 'next';
import { Blog } from '@server/entity';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { parseBlogInput, parseEntityId } from '@server/validation';
import { revalidateBlogPage } from '@server/blog-cache';

const deleteOrPutBlog = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseEntityId(req.query.id);
  if (!id) {
    return res.status(400).json({ code: 0, message: 'invalid id' });
  }

  switch (req.method) {
    case 'DELETE':
      try {
        const repo = await getRepo(Blog);
        const result = await repo.delete(id);
        if (!result.affected) {
          return res.status(404).json({ code: 0, message: 'blog not found' });
        }
        const revalidated = await revalidateBlogPage(res, id);
        res.status(200).json({ code: 1, revalidated });
      } catch (e) {
        console.error(e);
        res.status(500).json({ code: 0, message: '服务异常' });
      }
      break;
    case 'PUT':
    {
      const input = parseBlogInput(req.body);
      if (!input) {
        return res.status(400).json({ code: 0, message: 'invalid request' });
      }

      try {
        const repo = await getRepo(Blog);
        const result = await repo.update(id, input);
        if (!result.affected) {
          return res.status(404).json({ code: 0, message: 'blog not found' });
        }
        const revalidated = await revalidateBlogPage(res, id);
        res.status(200).json({ code: 1, revalidated });
      } catch (e) {
        console.error(e);
        res.status(500).json({ code: 0, message: '服务异常' });
      }
      break;
    }
    default:
      res.setHeader('Allow', 'DELETE, PUT');
      return res.status(405).json({ code: 0, message: 'method not allowed' });
  }
};

export default jwt(deleteOrPutBlog);
