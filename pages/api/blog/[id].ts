import type { NextApiRequest, NextApiResponse } from 'next';
import { Blog } from '@server/entity';
import { getRepo } from '@utils';
import { jwt } from '@middleware';

const deleteOrPutBlog = async (req: NextApiRequest, res: NextApiResponse) => {
  const repo = await getRepo(Blog);
  const { id } = req.query;
  if (!id) res.status(500).json({ code: 0, message: 'need id' });
  switch (req.method) {
    case 'DELETE':
      try {
        await repo.delete(id);
        res.status(200).json({ code: 1 });
      } catch (e) {
        res.status(500).json({ code: 0, message: e });
      }
      break;
    case 'PUT':
    {
      const { title, context } = req.body;
      await repo.update(id, { title, context });
      res.status(200).json({ code: 1 });
      break;
    }
    default:
      res.status(405).json({ code: 0 });
  }
};

export default jwt(deleteOrPutBlog);
