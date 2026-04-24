import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import FormData from 'form-data';
import axios from 'axios';
import { env } from '../../config/env.js';

export async function sendDeal(payload: { raw: any }) {
    const form = new FormData();

    form.append('raw', JSON.stringify(payload.raw));

    const images = Array.isArray(payload?.raw?.images) ? payload.raw.images : [];

    for (const image of images) {
        form.append('images', fs.createReadStream(image.tempPath), {
            filename: image.filename,
            contentType: image.mimeType || 'application/octet-stream',
        });
    }

    try {
        const response = await axios.post(`${env.serverUrl}/api/parser/raw`, form, {
            headers: {
                ...form.getHeaders(),
                'x-parser-token': env.parserToken,
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 30000,
        });

        for (const image of images) {
            try {
                await fsPromises.unlink(image.tempPath);
            } catch (error) {
                console.error('failed to delete temp file', image.tempPath, error);
            }
        }

        return response.data;
    } catch (error: any) {
        console.error('sendDeal failed');

        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }

        throw error;
    }
}