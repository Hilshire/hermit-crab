import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
} from 'typeorm';
import Blog from './Blog';

@Entity()
export default class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30 })
  name: string;

  @Column('text')
  context: string;

  @ManyToOne('Blog', 'comments')
  blog: Blog;
}
