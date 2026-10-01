import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { parseTagInput } from '@server/validation';
import { Tag } from '../../../server/entity';

const createTag = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'PUT':
    {
      const input = parseTagInput(req.body);
      if (!input) {
        return res.status(400).json({ code: 0, message: 'invalid request' });
      }

      const repo = await getRepo(Tag);
      const tag = new Tag();
      tag.name = input.name;
      tag.color = input.color;

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
      res.setHeader('Allow', 'PUT');
      return res.status(405).json({ code: 0, message: 'method not allowed' });
  }
};

export default jwt(createTag);
