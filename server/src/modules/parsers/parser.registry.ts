import { DealParser } from './parser.types.js';
import { zalogDoveriyaParser } from './telegram/zalogDoveriya.parser.js';
import {mosinvestfinanceParser} from "./telegram/mosinvestfinance.parser";
import {aktivKapitalParser} from "./telegram/aktivKapital.parser";
import {finExpertParser} from "./telegram/finExpert.parser";
import {kreditConsultParser} from "./telegram/kreditConsult.parser";
import {airIfParser} from "./telegram/airIf.parser";

export const parserRegistry = new Map<string, DealParser>([
    [zalogDoveriyaParser.key, zalogDoveriyaParser],
    [mosinvestfinanceParser.key, mosinvestfinanceParser],
    [aktivKapitalParser.key, aktivKapitalParser],
    [finExpertParser.key, finExpertParser],
    [kreditConsultParser.key, kreditConsultParser],
    [airIfParser.key, airIfParser],
]);