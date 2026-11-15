import type { NextApiRequest, NextApiResponse } from 'next';
import { IsNull, Not } from 'typeorm';
import { getRepo } from '@utils';
import { jwt } from '@middleware';
import { Blog } from '@server/entity';
import { parseEntityId } from '@server/validation';

async function restore(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ code: 0 });
  const id = parseEntityId(req.query.id);
  if (!id) return res.status(400).json({ code: 0 });
  const repo = await getRepo(Blog);
  const blog = await repo.findOneBy({ id, deletedAt: Not(IsNull()) });
  if (!blog) return res.status(404).json({ code: 0 });
  if (blog.parentId && !(await repo.findOneBy({ id: blog.parentId, deletedAt: IsNull() }))) {
    return res.status(400).json({ code: 0, message: '请先恢复主帖' });
  }
  await repo.manager.transaction(async (manager) => {
    await manager.update(Blog, { id }, { deletedAt: null, deletedWithId: null });
    await manager.update(Blog, { deletedWithId: id }, { deletedAt: null, deletedWithId: null });
  });
  return res.status(200).json({ code: 1 });
}
export default jwt(restore);
