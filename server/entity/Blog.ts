import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
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
}