export interface CharacterAPI {
  url: string;
  name: string;
  gender: string;
  culture: string;
  born: string;
  died: string;
  titles?: string[] | null;
  aliases?: string[] | null;
  father: string;
  mother: string;
  spouse: string;
  allegiances?: string[] | null;
  books?: string[] | null;
  povBooks?: string[] | null;
  tvSeries?: string[] | null;
  playedBy?: string[] | null;
}
