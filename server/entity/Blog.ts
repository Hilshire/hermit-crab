import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import Tag from './Tag';
import Comment from './Comment';

@Entity()
export default class Blog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {length: 50})
    title: string;

    @Column('blob')
    context: string;

    @ManyToMany('Tag')
    @JoinTable()
    tags: Tag[];
    
    @OneToMany('Comment', 'blog')
    comments: Comment[];

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    lastUpdateAt: string;
}