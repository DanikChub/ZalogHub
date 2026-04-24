import { zalogDoveriyaParser } from '../../sources/telegram/zalog-doveriya/parser.js';
import { aktivKapitalParser } from '../../sources/telegram/aktiv-kapital/parser.js';
import { finExpertParser } from '../../sources/telegram/fin-expert/parser.js';

export const parserRegistry = new Map([
    [zalogDoveriyaParser.sourceKey, zalogDoveriyaParser],
    [aktivKapitalParser.sourceKey, aktivKapitalParser],
    [finExpertParser.sourceKey, finExpertParser],
]);