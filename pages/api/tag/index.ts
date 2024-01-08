import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { Tag } from '../../../server/entity';

const createTag = async (req: NextApiRequest, res: NextApiResponse) => {
  const repo = await getRepo(Tag);
  switch (req.method) {
    case 'PUT':
    {
      const tag = new Tag();
      tag.name = req.body.name;
      tag.color = req.body.color;

      try {
        await repo.save(tag);
        res.status(200).json({ code: 1 });
      } catch (e) {
        console.error(e);
        res.status(500).json({ code: 0, message: '服务异常' });
      }
      break;
    }
    default:
      res.status(405).json({ code: 0 });
  }
};

export default jwt(createTag);
