import type { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';
import { serialize } from 'cookie';

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  const { claim } = req.body;

  try {
    if (compareSync(claim, process.env.CLAIM)) {
      const jwt = sign(
        {
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
        },
        process.env.SECRET_KEY,
      );

      res.setHeader('Set-Cookie', serialize('token', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60,
        path: '/',
      }));

      res.status(200).json({
        code: 1,
        message: 'ok',
      });
    } else {
      res.status(401).json({ code: 0, message: 'error claim' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 0, message: 'error when login' });
  }
};

export default login;
