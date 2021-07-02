import { ServerResponse } from 'http';
import jwt from 'jsonwebtoken';
import { NextApiResponse } from 'next';
import { CustomRequest } from 'utils/type';

export default (handler) => async (req: CustomRequest, res: NextApiResponse | ServerResponse) => {
  try {
    if (!req.cookies.token) {
      return handlerError(req, res);
    }
    try {
      jwt.verify(req.cookies.token, process.env.SECRET_KEY);
      handler(req, res);
    } catch (e) {
      console.error(e);
      return handlerError(req, res);
    }
  } catch (e) {
    console.error(e);
    return handlerError(req, res);
  }
};

function handlerError(req, res: NextApiResponse | ServerResponse) {
  if ('redirect' in res) {
    return res.json({ code: 2, location: `/login?target=${req.url}` });
  }

  res.writeHead(303, {
    Location: `/login?target=${req.url}`,
  });
  return res.end();
}
