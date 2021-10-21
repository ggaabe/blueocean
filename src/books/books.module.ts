import { CacheModule, Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { HttpModule } from '@nestjs/axios';
import { Book } from './entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharactersService } from 'src/characters/characters.service';
import { StoryCharacter } from 'src/characters/entities/character.entity';

@Module({
  imports: [
    HttpModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([Book, StoryCharacter]),
  ],
  controllers: [BooksController],
  providers: [BooksService, CharactersService],
})
export class BooksModule {}
