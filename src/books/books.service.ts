import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { firstValueFrom, Observable } from 'rxjs';
import { BookAPI } from 'src/models/BookAPI.model';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
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

  async findOne(id: number): Promise<Book> {
    const cachedBook: Book = await this.cacheManager.get(`book_${id}`);
    if (cachedBook) {
      return cachedBook;
    }

    const dbBook = await this.bookRepository.findOne(id);
    if (dbBook) {
      return dbBook;
    }

    const bookAPIResponse: AxiosResponse<BookAPI> = await firstValueFrom(
      this.httpService.get(`https://anapioficeandfire.com/api/books/${id}`),
    );
    if (bookAPIResponse.status != 200) {
      throw new Error('No book found with this ID');
    } else {
      const bookAPIResult = bookAPIResponse.data;
      if (bookAPIResult) {
        const bookResult: Book = {
          id,
          title: bookAPIResult.name,
          numberOfPages: bookAPIResult.numberOfPages,
          release: bookAPIResult.released,
        };
        if (bookAPIResult.characters) {
          bookResult.characterCount = bookAPIResult.characters.length;
        }
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
