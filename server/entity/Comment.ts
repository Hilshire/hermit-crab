import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation,
} from 'typeorm';
import Blog from './Blog';

@Entity('comment')
export default class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30 })
  name: string;

  @Column('text')
  context: string;

  @ManyToOne(() => Blog, (blog) => blog.comments)
  blog: Relation<Blog>;
}
