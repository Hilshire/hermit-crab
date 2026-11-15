import type { NextApiRequest, NextApiResponse } from 'next';
import { createBlog, updateBlog } from '@server/services/blog';
import createBlogRoute from '../../pages/api/blog';
import updateOrDeleteBlog from '../../pages/api/blog/[id]';

jest.mock('@middleware', () => ({ jwt: (handler: unknown) => handler }));
jest.mock('@server/services/blog', () => ({
  createBlog: jest.fn(),
  updateBlog: jest.fn(),
  deleteBlog: jest.fn(),
  addExistingBlog: jest.fn(),
  BlogError: class BlogError extends Error { code = 'invalid-parent'; },
}));

function response() {
  const res = { status: jest.fn(), json: jest.fn(), setHeader: jest.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as NextApiResponse;
}

const validInput = { title: 'Title', context: 'Body', blogType: 1, tagIds: [1] };

describe('blog API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects an invalid create body before calling the service', async () => {
    const res = response();
    await createBlogRoute({ method: 'PUT', body: { title: '' } } as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(createBlog).not.toHaveBeenCalled();
  });

  it('passes validated input to the create service', async () => {
    const res = response();
    await createBlogRoute({ method: 'PUT', body: validInput } as NextApiRequest, res);
    expect(createBlog).toHaveBeenCalledWith(expect.objectContaining(validInput));
    expect(res.json).toHaveBeenCalledWith({ code: 1 });
  });

  it('returns 500 when the service fails', async () => {
    (createBlog as jest.Mock).mockRejectedValueOnce(new Error('db down'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const res = response();
    await createBlogRoute({ method: 'PUT', body: validInput } as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(500);
    consoleError.mockRestore();
  });

  it('rejects an invalid id for update', async () => {
    const res = response();
    await updateOrDeleteBlog({ method: 'PUT', query: { id: 'nope' } } as unknown as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('passes validated input to the update service', async () => {
    const res = response();
    const req = { method: 'PUT', query: { id: '2' }, body: validInput } as unknown as NextApiRequest;
    await updateOrDeleteBlog(req, res);
    expect(updateBlog).toHaveBeenCalledWith(2, expect.objectContaining(validInput));
    expect(res.json).toHaveBeenCalledWith({ code: 1 });
  });
});
