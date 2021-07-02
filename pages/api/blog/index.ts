import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { Blog } from '../../../server/entity';

const createBlog = async (req: NextApiRequest, res: NextApiResponse) => {
  const repo = await getRepo(Blog);
  switch (req.method) {
    case 'PUT':
    {
      const blog = new Blog();
      blog.title = req.body.title;
      blog.context = req.body.context;

      try {
        await repo.save(blog);
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

export default jwt(createBlog);
