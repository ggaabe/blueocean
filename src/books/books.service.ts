import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { firstValueFrom, Observable } from 'rxjs';
import { CharactersService } from 'src/characters/characters.service';
import { StoryCharacter } from 'src/characters/entities/character.entity';
import { BookAPI } from 'src/models/BookAPI.model';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  private charactersRegex = /characters\/(\d+)/i;
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private characterService: CharactersService,
  ) {}
  create(createBookDto: CreateBookDto) {
    return 'This action adds a new book';
  }

  async findAll(): Promise<BookAPI[]> {
    // return await [];
    const allBooksResponse = await firstValueFrom(
      this.httpService.get<BookAPI[]>(
        `https://anapioficeandfire.com/api/books`,
      ),
    );
    const allBooks: BookAPI[] = allBooksResponse.data;
    return allBooks;
  }

  async findWithCharacters(id: number): Promise<Book> {
    let foundBook = await this.bookRepository.findOne(id, {
      relations: ['characters'],
    });
    if (!foundBook) {
      await this.findOne(id);
      foundBook = await this.bookRepository.findOne(id, {
        relations: ['characters'],
      });
    }
    console.log(foundBook);
    if (foundBook && foundBook.characters && foundBook.characters.length > 0) {
      const characters = [];
      const queryList: Promise<StoryCharacter>[] = [];
      const indexMapping = {};
      for (const [index, character] of foundBook.characters.entries()) {
        if (!character.name) {
          queryList.push(this.characterService.findOne(character.id));
          indexMapping[character.id] = index;
        }
      }
      const finalResults = await Promise.all(queryList);
      // console.log(queryList);
      for (const characterResult of finalResults) {
        // console.log(characterResult);
        if (characterResult && characterResult.name) {
          foundBook.characters[indexMapping[characterResult.id]] =
            characterResult;
        }
      }
      // foundBook.characters = characters;
    }
    return foundBook;
  }

  async findOne(id: number): Promise<Book> {
    const cachedBook: Book = await this.cacheManager.get(`book_${id}`);
    // this.logger.debug(`Cache result: ${cachedBook}`);
    if (cachedBook) {
      this.logger.debug(`Cache hit for book ID ${id}`);
      return cachedBook;
    }

    const dbBook = await this.bookRepository.findOne(id, {
      // relations: ['characters'],
    });
    if (dbBook) {
      this.logger.debug(`DB hit for book ID ${id}`);
      await this.cacheManager.set(`book_${id}`, dbBook, { ttl: 36000000 });
      return dbBook;
    }

    this.logger.debug(`No book ID ${id} found in DB. Retrieving from API.`);
    const bookAPIResponse: AxiosResponse<BookAPI> = await firstValueFrom(
      this.httpService.get(`https://anapioficeandfire.com/api/books/${id}`),
    );
    if (bookAPIResponse.status != 200) {
      this.logger.debug(`No book found with ID ${id}`);
      throw new Error('No book found with this ID');
    } else {
      const bookAPIResult = bookAPIResponse.data;
      if (bookAPIResult) {
        this.logger.debug(`API retrieved result for book ID ${id}`);

        const bookResult = new Book();
        bookResult.id = id;
        bookResult.title = bookAPIResult.name;
        bookResult.numberOfPages = bookAPIResult.numberOfPages;
        bookResult.release = bookAPIResult.released;
        bookResult.characters = [];
        if (bookAPIResult.characters) {
          bookResult.characterCount = bookAPIResult.characters.length;
          for (const characterURL of bookAPIResult.characters) {
            const regexMatches = this.charactersRegex.exec(characterURL);
            if (regexMatches && regexMatches[1]) {
              // this.logger.debug(`Match: ${regexMatches[1]}`);
              const characterID = parseInt(regexMatches[1]);
              const finalCharacter = new StoryCharacter();
              finalCharacter.id = characterID;
              finalCharacter.aliases = [];
              finalCharacter.playedBy = [];
              bookResult.characters.push(finalCharacter);
            } else {
              this.logger.warn(
                `No RegEx match on character URL: ${characterURL}`,
              );
            }
          }
        }

        await this.bookRepository.save(bookResult);
        delete bookResult.characters;
        this.logger.debug(`Setting cache for book_${id}`);
        await this.cacheManager.set(`book_${id}`, bookResult, {
          ttl: 36000000,
        });

        return bookResult;
      } else {
        throw new Error('No book found with this ID');
      }
    }
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
