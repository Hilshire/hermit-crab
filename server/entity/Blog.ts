import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable,
  CreateDateColumn, UpdateDateColumn, OneToMany, Relation,
} from 'typeorm';
import Tag from './Tag';
import Comment from './Comment';
import { BlogType } from './type';

@Entity('blog')
export default class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  title: string;

  @Column('text')
  context: string;

  @Column('int', { default: BlogType.COMMON })
  blogType: BlogType;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Relation<Tag>[];

  // @OneToMany('Comment', 'blog')
  @OneToMany(() => Comment, (comment) => comment.blog)
  comments: Relation<Comment>[];

  @CreateDateColumn()
  createAt: string;

  @UpdateDateColumn()
  lastUpdateAt: string;
}
