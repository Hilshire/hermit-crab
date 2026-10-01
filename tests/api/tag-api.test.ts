import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepo } from '@utils';
import createTag from '../../pages/api/tag';
import updateOrDeleteTag from '../../pages/api/tag/[id]';

jest.mock('@middleware', () => ({ jwt: (handler: unknown) => handler }));
jest.mock('@utils', () => ({ getRepo: jest.fn() }));
jest.mock('@server/entity', () => ({ Blog: function Blog() {}, Tag: function Tag() {} }));

const mockedGetRepo = getRepo as jest.MockedFunction<typeof getRepo>;

function response() {
  const res = { status: jest.fn(), json: jest.fn(), setHeader: jest.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as NextApiResponse;
}

describe('tag API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects invalid tag input', async () => {
    const res = response();
    await createTag({ method: 'PUT', body: { name: '', color: 'blue' } } as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedGetRepo).not.toHaveBeenCalled();
  });

  it('creates a tag', async () => {
    const repo = { save: jest.fn() };
    mockedGetRepo.mockResolvedValue(repo as never);
    const res = response();

    await createTag({ method: 'PUT', body: { name: 'TypeScript', color: '#3178c6' } } as NextApiRequest, res);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'TypeScript', color: '#3178c6' }));
    expect(res.json).toHaveBeenCalledWith({ code: 1, tag: expect.objectContaining({ name: 'TypeScript' }) });
  });

  it('reports a failed tag write', async () => {
    const repo = { save: jest.fn(async () => { throw new Error('db down'); }) };
    mockedGetRepo.mockResolvedValue(repo as never);
    const res = response();
    jest.spyOn(console, 'error').mockImplementation();

    await createTag({ method: 'PUT', body: { name: 'TypeScript', color: '#3178c6' } } as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('updates an existing tag', async () => {
    const repo = { update: jest.fn(async () => ({ affected: 1 })) };
    mockedGetRepo.mockResolvedValue(repo as never);
    const res = response();

    await updateOrDeleteTag({ method: 'PUT', query: { id: '4' }, body: { name: 'React', color: '#61dafb' } } as unknown as NextApiRequest, res);
    expect(repo.update).toHaveBeenCalledWith(4, { name: 'React', color: '#61dafb' });
    expect(res.json).toHaveBeenCalledWith({ code: 1, tag: { id: 4, name: 'React', color: '#61dafb' } });
  });
});
