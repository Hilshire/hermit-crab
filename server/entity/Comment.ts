import { Entity, PrimaryGeneratedColumn, Column, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany } from 'typeorm';
import Blog from './Blog';
import Essay from './Essay'

@Entity()
export default class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('blob')
    context: string;

    @ManyToOne(() => Blog, blog => blog.comments)
    blog: Blog;

    @ManyToMany(() => Essay, essay => essay.comments)
    essay: Essay;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    lastUpdateAt: string;
}