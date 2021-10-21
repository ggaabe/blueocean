import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { StoryCharacter } from 'src/characters/entities/character.entity';
import { Not, Repository } from 'typeorm';

import { CharacterAPI } from 'src/models/CharacterAPI.model';

@Injectable()
export class CharactersService {
  private charactersRegex = /characters\/(\d+)/i;
  private readonly logger = new Logger(CharactersService.name);

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(StoryCharacter)
    private characterRepository: Repository<StoryCharacter>,
  ) {}
  create(createCharacterDto: CreateCharacterDto) {
    return 'This action adds a new character';
  }

  async findAll(): Promise<CharacterAPI[]> {
    // return await [];
    const allCharactersResponse = await firstValueFrom(
      this.httpService.get<CharacterAPI[]>(
        `https://anapioficeandfire.com/api/characters`,
      ),
    );
    const allCharacters: CharacterAPI[] = allCharactersResponse.data;
    return allCharacters;
  }

  async findForBook(id: number): Promise<StoryCharacter[]> {
    const dbCharacter = await this.characterRepository.find({
      relations: ['books'],
      where: {
        books: {
          id,
        },
      },
    });
    console.log(dbCharacter);
    return dbCharacter;
  }

  async findOne(id: number): Promise<StoryCharacter> {
    const cachedCharacter: StoryCharacter = await this.cacheManager.get(
      `character_${id}`,
    );
    // this.logger.debug(`Cache result: ${cachedCharacter}`);
    if (cachedCharacter) {
      this.logger.debug(`Cache hit for character ID ${id}`);
      return cachedCharacter;
    }

    const dbCharacter = await this.characterRepository.findOne(id, {
      where: { name: Not('') },
    });
    if (dbCharacter) {
      this.logger.debug(`DB hit for character ID ${id}`);
      await this.cacheManager.set(`character_${id}`, dbCharacter, {
        ttl: 36000000,
      });
      return dbCharacter;
    }

    this.logger.debug(
      `No character ID ${id} with data found in DB. Retrieving from API.`,
    );
    const characterAPIResponse: AxiosResponse<CharacterAPI> =
      await firstValueFrom(
        this.httpService.get(
          `https://anapioficeandfire.com/api/characters/${id}`,
        ),
      );
    if (characterAPIResponse.status != 200) {
      this.logger.debug(`No character found with ID ${id}`);
      throw new Error('No character found with this ID');
    } else {
      const characterAPIResult = characterAPIResponse.data;
      if (characterAPIResult) {
        this.logger.debug(`API retrieved result for character ID ${id}`);

        const characterResult = new StoryCharacter();
        characterResult.id = id;
        characterResult.name = characterAPIResult.name;
        characterResult.gender = characterAPIResult.gender;
        characterResult.born = characterAPIResult.born;
        characterResult.died = characterAPIResult.died;
        characterResult.aliases = characterAPIResult.aliases || [];
        characterResult.playedBy = characterAPIResult.playedBy || [];
        console.log(characterResult);
        await this.characterRepository.save(characterResult);

        this.logger.debug(`Setting cache for character_${id}`);
        await this.cacheManager.set(`character_${id}`, characterResult, {
          ttl: 36000000,
        });

        return characterResult;
      } else {
        throw new Error('No character found with this ID');
      }
    }
  }

  update(id: number, updateCharacterDto: UpdateCharacterDto) {
    return `This action updates a #${id} character`;
  }

  remove(id: number) {
    return `This action removes a #${id} character`;
  }
}
