import {
  Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity()
export default class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20 })
  name: string;
}
