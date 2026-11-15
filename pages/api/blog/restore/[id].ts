import type { NextApiRequest, NextApiResponse } from 'next';
import { jwt } from '@middleware';
import { sendBlogError } from '@server/blog-api-error';
import { parseEntityId } from '@server/validation';
import { restoreBlog } from '@server/services/blog';

async function restore(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ code: 0, message: 'method not allowed' });
  }
  const id = parseEntityId(req.query.id);
  if (!id) return res.status(400).json({ code: 0, message: 'invalid id' });
  try {
    await restoreBlog(id);
    return res.status(200).json({ code: 1 });
  } catch (error) {
    return sendBlogError(res, error);
  }
}
export default jwt(restore);
