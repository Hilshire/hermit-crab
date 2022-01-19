import {
  Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';
import { CollectionType } from './type';

@Entity()
export default class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20 })
  name: string;

  @Column('int', { default: CollectionType.TAG })
  type: CollectionType;
}
