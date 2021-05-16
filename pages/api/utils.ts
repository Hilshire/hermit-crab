import { EntityTarget, getConnection } from "typeorm"
import { prepareConnection } from "../../server/connection"
import { getEnv } from "../../util"

export async function getRepo<T>(entity: EntityTarget<T>) {
  await prepareConnection()
  const connection = getConnection(getEnv())
  const repo = await connection.getRepository(entity)
  return repo
}