import type { NextApiRequest, NextApiResponse } from 'next'
import { Essay } from '../../../server/entity'
import { getRepo } from '@utils'
import { jwt } from '@middleware'


const createEssay = async (req: NextApiRequest, res: NextApiResponse) => {
  const repo = await getRepo(Essay)
  switch(req.method) {
    case 'PUT':
      const essay = new Essay()
      essay.title = req.body.title
      essay.context = req.body.context

      try {
        await repo.save(essay)
        res.status(200).json({ code: 1 })
      } catch (e) {
        res.status(500).json({ code: 0, message: e })
      }
      break
    default:
      res.status(405).json({ code: 0 })
  }
}

export default jwt(createEssay)