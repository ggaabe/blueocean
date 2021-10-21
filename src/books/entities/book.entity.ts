import { Entity, Column, ManyToMany, JoinTable, PrimaryColumn } from 'typeorm';
import { StoryCharacter } from '../../characters/entities/character.entity';

@Entity()
export class Book {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column('int')
  numberOfPages: number;

  @Column('date')
  release: string;

  @Column('int')
  characterCount?: number;

  @ManyToMany(() => StoryCharacter, (character) => character.books, {
    cascade: true,
  })
  @JoinTable()
  characters?: StoryCharacter[];
}
