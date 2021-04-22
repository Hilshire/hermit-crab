import type { NextApiRequest, NextApiResponse } from 'next'
import { getConnection } from 'typeorm'
import { Blog } from '../../server/entity'
import { prepareConnection } from '../../server/connection'
import { getEnv } from '../../util'


export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    await prepareConnection()
    const connection = getConnection(getEnv())
    const repo = await connection.getRepository(Blog)

    const blog = new Blog()
    blog.title = req.body.title
    blog.context = req.body.context

    try {
      await repo.save(blog)
      res.status(200).json({ code: 1 })
    } catch (e) {
      res.status(500).json({ code: 0, message: e })
    }
  } else {
    res.status(405).json({ code: 0 })
  }
}