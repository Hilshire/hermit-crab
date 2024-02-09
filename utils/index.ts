import { EntityTarget } from 'typeorm';
import { prepareConnection } from '@server/connection';

export async function getRepo<T>(entity: EntityTarget<T>) {
  const connection = await prepareConnection();
  const repo = await connection.getRepository(entity);
  return repo;
}

export * from './type';
