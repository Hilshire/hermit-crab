import type { NextApiRequest, NextApiResponse } from 'next';
import { jwt } from '@middleware';
import { sendBlogError } from '@server/blog-api-error';
import { parseBlogInput, parseEntityId } from '@server/validation';
import { addExistingBlog, deleteBlog, updateBlog } from '@server/services/blog';

async function handleBlog(req: NextApiRequest, res: NextApiResponse) {
  const id = parseEntityId(req.query.id);
  if (!id) return res.status(400).json({ code: 0, message: 'invalid id' });

  try {
    switch (req.method) {
      case 'DELETE':
        await deleteBlog(id);
        break;
      case 'PATCH': {
        const parentId = req.body?.parentId;
        if (!Number.isSafeInteger(parentId) || parentId <= 0 || parentId === id) {
          return res.status(400).json({ code: 0, message: '无效的主帖' });
        }
        await addExistingBlog(id, parentId);
        break;
      }
      case 'PUT': {
        const input = parseBlogInput(req.body);
        if (!input) return res.status(400).json({ code: 0, message: 'invalid request' });
        await updateBlog(id, input);
        break;
      }
      default:
        res.setHeader('Allow', 'DELETE, PATCH, PUT');
        return res.status(405).json({ code: 0, message: 'method not allowed' });
    }
    return res.status(200).json({ code: 1 });
  } catch (error) {
    return sendBlogError(res, error);
  }
}

export default jwt(handleBlog);
