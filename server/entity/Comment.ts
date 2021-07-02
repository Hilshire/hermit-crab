import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
} from 'typeorm';
import Blog from './Blog';
import Essay from './Essay';

@Entity()
export default class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('blob')
  context: string;

  @ManyToOne('Blog', 'comments')
  blog: Blog;

  @ManyToOne('Essay', 'comments')
  essay: Essay;
}
