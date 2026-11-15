import type { NextApiResponse } from 'next';
import { BlogError } from '@server/services/blog';

export function sendBlogError(res: NextApiResponse, error: unknown) {
  if (error instanceof BlogError) {
    const status = error.code === 'not-found' ? 404 : 400;
    return res.status(status).json({ code: 0, message: error.message });
  }
  console.error(error);
  return res.status(500).json({ code: 0, message: '服务异常' });
}
