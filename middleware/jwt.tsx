import bcrypt from 'bcrypt';
import { promisify } from 'util'
import jwt from 'jsonwebtoken';
import { NextApiResponse } from 'next';
import { CustomRequest, JwtDecode } from 'utils/type';

const KEY = process.env.JWT_KEY;

export default handler => async (req: CustomRequest, res: NextApiResponse) => {
    try {
        if (!req.headers['x-forwarded-host']) {
            res.redirect('/login')
        }
        const decoded: JwtDecode = await promisify(jwt.verify)(req.headers['x-forwarded-host'] as string, KEY)
        if (decoded?.token !== process.env.MANAGER_PWD) {
            return res.status(401).send({ code: 0, message: 'auth fail'})
        }
        
        req.token = decoded.token

        handler(req, res)
    } catch (e) {
        console.error(e)
        return res.status(401).send({ code: 0, message: 'auth fail'})
    }
}