import { Source } from '../../db/models/Source.js';
import { parserRegistry } from './parser.registry.js';

export function resolveParserBySource(source: Source) {
    return parserRegistry.get(source.key) ?? null;
}