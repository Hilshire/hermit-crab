import { DataSource, Repository } from 'typeorm';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Blog, Tag, Comment } from '@server/entity';
import { getRepo } from '@utils';
import updateOrDelete from '../../pages/api/blog/[id]';
import restore from '../../pages/api/blog/restore/[id]';

jest.mock('@middleware', () => ({ jwt: (handler: unknown) => handler }));
jest.mock('@utils', () => ({ getRepo: jest.fn() }));

function response() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as NextApiResponse;
}

describe('series deletion and restoration', () => {
  let database: DataSource;
  let repo: Repository<Blog>;
  beforeEach(async () => {
    database = new DataSource({
      type: 'sqlite', database: ':memory:', entities: [Blog, Tag, Comment], synchronize: true,
    });
    await database.initialize();
    repo = database.getRepository(Blog);
    (getRepo as jest.Mock).mockResolvedValue(repo);
  });
  afterEach(async () => { await database.destroy(); jest.clearAllMocks(); });

  it('restores only children deleted together with the parent', async () => {
    const parent = await repo.save(repo.create({ title: 'parent', context: 'body' }));
    const child = await repo.save(repo.create({ title: 'child', context: 'body', parentId: parent.id }));
    const earlier = await repo.save(repo.create({
      title: 'earlier', context: 'body', parentId: parent.id,
    }));
    const req = (method: string, id: number) => (
      { method, query: { id: String(id) } } as unknown as NextApiRequest
    );
    await updateOrDelete(req('DELETE', earlier.id), response());
    await updateOrDelete(req('DELETE', parent.id), response());
    expect((await repo.findOneByOrFail({ id: child.id })).deletedWithId).toBe(parent.id);
    const blocked = response();
    await restore(req('POST', child.id), blocked);
    expect(blocked.status).toHaveBeenCalledWith(400);
    await restore(req('POST', parent.id), response());
    expect((await repo.findOneByOrFail({ id: child.id })).deletedAt).toBeNull();
    expect((await repo.findOneByOrFail({ id: earlier.id })).deletedAt).not.toBeNull();
  });
  it('rejects moving a parent that still has deleted children', async () => {
    const parent = await repo.save(repo.create({ title: 'parent', context: 'body' }));
    const other = await repo.save(repo.create({ title: 'other', context: 'body' }));
    await repo.save(repo.create({
      title: 'child', context: 'body', parentId: parent.id, deletedAt: new Date(),
    }));
    const res = response();
    await updateOrDelete({
      method: 'PUT',
      query: { id: String(parent.id) },
      body: {
        title: 'parent', context: 'body', blogType: 1, parentId: other.id,
      },
    } as unknown as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect((await repo.findOneByOrFail({ id: parent.id })).parentId).toBeNull();
  });

  it('adds an existing independent article without changing its content', async () => {
    const parent = await repo.save(repo.create({ title: 'parent', context: 'body' }));
    const article = await repo.save(repo.create({ title: 'article', context: 'original' }));
    const res = response();
    await updateOrDelete({
      method: 'PATCH', query: { id: String(article.id) }, body: { parentId: parent.id },
    } as unknown as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(await repo.findOneByOrFail({ id: article.id })).toMatchObject({
      parentId: parent.id, title: 'article', context: 'original',
    });
  });

  it('rejects adding an article that has deleted children', async () => {
    const parent = await repo.save(repo.create({ title: 'parent', context: 'body' }));
    const article = await repo.save(repo.create({ title: 'article', context: 'body' }));
    await repo.save(repo.create({
      title: 'old child', context: 'body', parentId: article.id, deletedAt: new Date(),
    }));
    const res = response();
    await updateOrDelete({
      method: 'PATCH', query: { id: String(article.id) }, body: { parentId: parent.id },
    } as unknown as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect((await repo.findOneByOrFail({ id: article.id })).parentId).toBeNull();
  });
});
