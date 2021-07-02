import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { Tip } from '../../../server/entity';

const createTip = async (req: NextApiRequest, res: NextApiResponse) => {
  const repo = await getRepo(Tip);
  switch (req.method) {
    case 'PUT':
    {
      const tip = new Tip();
      tip.title = req.body.title;
      tip.context = req.body.context;

      try {
        await repo.save(tip);
        res.status(200).json({ code: 1 });
      } catch (e) {
        res.status(500).json({ code: 0, message: e });
      }
      break;
    }
    default:
      res.status(405).json({ code: 0 });
  }
};

export default jwt(createTip);
