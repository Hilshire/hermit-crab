import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import Tag from './Tag';

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
    tags: Tag[]

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    lastUpdateAt: string;
}