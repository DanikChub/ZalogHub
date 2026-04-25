import axios from 'axios';

import { ParserSourceConfig } from '../../core/types/source-config.js';
import {env} from "../../config/env.js";


export async function getSources(): Promise<ParserSourceConfig[]> {
    const response = await axios.get(`${env.serverUrl}/api/parser/sources`, {
        headers: {
            'x-parser-token': env.parserToken,
        },
        timeout: 15000,
    });

    return Array.isArray(response.data?.items) ? response.data.items : [];
}