import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepo } from '@utils';
import { revalidateBlogPage } from '@server/blog-cache';
import createBlog from '../../pages/api/blog';
import updateOrDeleteBlog from '../../pages/api/blog/[id]';

jest.mock('@middleware', () => ({ jwt: (handler: unknown) => handler }));
jest.mock('@utils', () => ({ getRepo: jest.fn() }));
jest.mock('@server/blog-cache', () => ({ revalidateBlogPage: jest.fn(async () => true) }));
jest.mock('@server/entity', () => ({ Blog: function Blog() {}, Tag: function Tag() {} }));

const mockedGetRepo = getRepo as jest.MockedFunction<typeof getRepo>;
const mockedRevalidate = revalidateBlogPage as jest.MockedFunction<typeof revalidateBlogPage>;

function response() {
  const res = { status: jest.fn(), json: jest.fn(), setHeader: jest.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as NextApiResponse;
}

const validInput = {
  title: 'Title', context: 'Body', blogType: 1, tagIds: [1],
};

describe('blog API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects an invalid create body before querying the database', async () => {
    const res = response();
    await createBlog({ method: 'PUT', body: { title: '' } } as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedGetRepo).not.toHaveBeenCalled();
  });

  it('creates a blog with validated tags', async () => {
    const blog = {};
    const blogRepo = { create: jest.fn(() => blog), save: jest.fn() };
    const tagRepo = { findByIds: jest.fn(async () => [{ id: 1 }]) };
    mockedGetRepo.mockResolvedValueOnce(blogRepo as never).mockResolvedValueOnce(tagRepo as never);
    const res = response();

    await createBlog({ method: 'PUT', body: validInput } as NextApiRequest, res);
    expect(blogRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tags: [{ id: 1 }] }));
    expect(blogRepo.save).toHaveBeenCalledWith(blog);
    expect(res.json).toHaveBeenCalledWith({ code: 1 });
  });

  it('returns 500 when a create write fails', async () => {
    const blogRepo = { create: jest.fn(() => ({})), save: jest.fn(async () => { throw new Error('db down'); }) };
    const tagRepo = { findByIds: jest.fn(async () => [{ id: 1 }]) };
    mockedGetRepo.mockResolvedValueOnce(blogRepo as never).mockResolvedValueOnce(tagRepo as never);
    const res = response();
    jest.spyOn(console, 'error').mockImplementation();

    await createBlog({ method: 'PUT', body: validInput } as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('rejects an invalid id for update', async () => {
    const res = response();
    await updateOrDeleteBlog({ method: 'PUT', query: { id: 'nope' } } as unknown as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates a blog and revalidates its page', async () => {
    const blog = { id: 2, tags: [] };
    const blogRepo = { findOneBy: jest.fn(async () => blog), save: jest.fn() };
    const tagRepo = { findByIds: jest.fn(async () => [{ id: 1 }]) };
    mockedGetRepo.mockResolvedValueOnce(blogRepo as never).mockResolvedValueOnce(tagRepo as never);
    const res = response();

    const req = { method: 'PUT', query: { id: '2' }, body: validInput } as unknown as NextApiRequest;
    await updateOrDeleteBlog(req, res);
    expect(blogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: 2, tags: [{ id: 1 }],
    }));
    expect(mockedRevalidate).toHaveBeenCalledWith(res, 2);
    expect(res.json).toHaveBeenCalledWith({ code: 1, revalidated: true });
  });
});
