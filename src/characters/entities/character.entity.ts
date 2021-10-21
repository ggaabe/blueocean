import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity()
export class StoryCharacter {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  name: string;

  @Column()
  gender: string;

  @Column()
  culture: string;

  @Column()
  born: string;

  @Column()
  died: string;

  @Column('simple-array')
  aliases: string[];

  @Column('simple-array')
  playedBy: string[];

  @ManyToMany(() => Book, (book) => book.characters)
  books: Book[];
}
