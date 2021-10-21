import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity()
export class StoryCharacter {
  @PrimaryColumn()
  id: number;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  gender: string;

  @Column({ default: '' })
  culture: string;

  @Column({ default: '' })
  born: string;

  @Column({ default: '' })
  died: string;

  @Column('simple-array', { select: false })
  aliases?: string[];

  @Column('simple-array', { select: false })
  playedBy?: string[];

  @ManyToMany(() => Book, (book) => book.characters)
  books: Book[];
}
