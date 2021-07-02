import { NextApiRequest } from 'next';

export interface CustomRequest extends NextApiRequest {
  token: string
}

export interface JwtDecode {
  token: string
}
