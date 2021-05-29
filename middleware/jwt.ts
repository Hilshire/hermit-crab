import jwt from 'jsonwebtoken';
import { NextApiResponse } from 'next';
import { CustomRequest, JwtDecode } from 'utils/type';

export default handler => async (req: CustomRequest, res: NextApiResponse) => {
    try {
        if (!req.cookies.token) {
            return handlerError(req, res)
        }
        try {
            jwt.verify(req.cookies.token, process.env.SECRET_KEY)
            handler(req, res)
        } catch (e) {
            console.error(e)            
            return handlerError(req, res)
        }
    } catch (e) {
        console.error(e)
        return handlerError(req, res)
    }
}

function handlerError(req, res) {
    res.writeHead(301, {
        Location: `/login?target=${req.url}`
    })
    return res.end()
}