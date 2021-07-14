import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import Tag from './Tag';

@Entity()
export default class Tip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50 })
  title: string;

  @Column('text')
  context: string;

  @ManyToMany('Tag')
  @JoinTable()
  tags: Tag[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  lastUpdateAt: string;
}
