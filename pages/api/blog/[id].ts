import type { NextApiRequest, NextApiResponse } from 'next';
import { Blog } from '@server/entity';
import { getRepo } from '@utils';
import { jwt } from '@middleware';

const deleteOrPutBlog = async (req: NextApiRequest, res: NextApiResponse) => {
  const repo = await getRepo(Blog);
  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ code: 0, message: 'invalid id' });
  }
  switch (req.method) {
    case 'DELETE':
      try {
        await repo.delete(id);
        res.status(200).json({ code: 1 });
      } catch (e) {
        console.error(e);
        res.status(500).json({ code: 0, message: '服务异常' });
      }
      break;
    case 'PUT':
    {
      const { title, context, blogType } = req.body;
      await repo.update(id, { title, context, blogType: Number(blogType) });
      res.status(200).json({ code: 1 });
      break;
    }
    default:
      res.status(405).json({ code: 0 });
  }
};

export default jwt(deleteOrPutBlog);
