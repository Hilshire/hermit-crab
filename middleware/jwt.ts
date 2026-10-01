import { verify } from 'jsonwebtoken';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getJwtSecret } from '@server/config';

export function isAuthenticated(req: Pick<NextApiRequest, 'cookies'>) {
  const { token } = req.cookies;
  if (!token) return false;

  const secretKey = getJwtSecret();

  try {
    verify(token, secretKey);
    return true;
  } catch (e) {
    return false;
  }
}

export function getLoginRedirect(req: Pick<NextApiRequest, 'url'>) {
  const target = req.url || '/manage/blog';
  return `/manage/login?target=${encodeURIComponent(target)}`;
}

export default function jwt(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    if (!isAuthenticated(req)) {
      return handlerError(res);
    }

    return handler(req, res);
  };
}

function handlerError(res: NextApiResponse) {
  return res.status(401).json({ code: 2, location: '/manage/login' });
}
