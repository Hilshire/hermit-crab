import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import Tag from './Tag';
import Comment from './Comment';

@Entity()
export default class Bolg {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {length: 50})
    title: string;

    @Column('blob')
    context: string;

    @ManyToMany(type => Tag, tag => tag.blogs)
    @JoinTable()
    tags: Tag[];
    
    @OneToMany(type => Comment, comment => comment.blog)
    @JoinTable()
    comments: Comment[];

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    lastUpdateAt: string;
}