import {
  Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity('tag')
export default class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20 })
  name: string;

  @Column('varchar', { length: 7 })
  color: string;
}
