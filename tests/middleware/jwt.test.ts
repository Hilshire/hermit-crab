import type { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import jwt, { isAuthenticated } from '../../middleware/jwt';

jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));
jest.mock('@server/config', () => ({ getJwtSecret: jest.fn(() => 'test-secret') }));

const mockedVerify = verify as jest.MockedFunction<typeof verify>;

function response() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as NextApiResponse;
}

describe('jwt middleware', () => {
  beforeEach(() => jest.resetAllMocks());

  it('rejects a missing token without calling the handler', async () => {
    const handler = jest.fn();
    const res = response();
    await jwt(handler)({ cookies: {} } as NextApiRequest, res);

    expect(handler).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ code: 2, location: '/manage/login' });
  });

  it('accepts a token that verifies successfully', async () => {
    mockedVerify.mockReturnValue(undefined);
    const handler = jest.fn();
    const req = { cookies: { token: 'valid-token' } } as unknown as NextApiRequest;

    expect(isAuthenticated(req)).toBe(true);
    await jwt(handler)(req, response());
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('treats a verification failure as unauthenticated', () => {
    mockedVerify.mockImplementation(() => { throw new Error('bad token'); });
    expect(isAuthenticated({ cookies: { token: 'bad-token' } } as unknown as NextApiRequest)).toBe(false);
  });
});
