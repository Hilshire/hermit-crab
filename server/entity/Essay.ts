import {
  Entity, PrimaryGeneratedColumn, Column, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import Comment from './Comment';

@Entity()
export default class Essay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50 })
  title: string;

  @Column('text')
  context: string;

  @OneToMany('Comment', 'blog')
  @JoinTable()
  comments: Comment[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  lastUpdateAt: string;
}
