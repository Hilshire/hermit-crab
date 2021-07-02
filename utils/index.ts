import { EntityTarget, getConnection } from 'typeorm';
import { prepareConnection } from '@server/connection';

export async function getRepo<T>(entity: EntityTarget<T>) {
  await prepareConnection();
  const connection = getConnection(process.env.NODE_ENV);
  const repo = await connection.getRepository(entity);
  return repo;
}

export * from './type';
