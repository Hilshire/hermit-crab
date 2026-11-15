import type { NextApiRequest, NextApiResponse } from 'next';
import { jwt } from '@middleware';
import { sendBlogError } from '@server/blog-api-error';
import { parseBlogInput } from '@server/validation';
import { createBlog } from '@server/services/blog';

async function handleBlog(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ code: 0, message: 'method not allowed' });
  }
  const input = parseBlogInput(req.body);
  if (!input) return res.status(400).json({ code: 0, message: 'invalid request' });
  try {
    await createBlog(input);
    return res.status(200).json({ code: 1 });
  } catch (error) {
    return sendBlogError(res, error);
  }
}

export default jwt(handleBlog);
