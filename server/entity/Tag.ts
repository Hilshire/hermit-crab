import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import Blog from './Blog'

@Entity()
export default class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {length: 20})
    name: string;

    @ManyToMany(type => Blog, blog => blog.tags)
    blogs: Blog[];
}