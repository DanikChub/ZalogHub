import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import FormData from 'form-data';
import axios from 'axios';
import { env } from './config/env.js';

export async function sendDeal(payload: { raw: any }) {
    console.log('🌐 [sendDeal] sending RAW payload to server...');
    console.log('🌐 [sendDeal] url:', `${env.serverUrl}/api/parser/raw`);
    console.log('🌐 [sendDeal] token exists:', Boolean(env.parserToken));

    const form = new FormData();

    // 🔥 теперь только raw
    form.append('raw', JSON.stringify(payload.raw));

    const images = Array.isArray(payload?.raw?.images) ? payload.raw.images : [];

    for (const image of images) {
        form.append('images', fs.createReadStream(image.tempPath), {
            filename: image.filename,
            contentType: image.mimeType || 'application/octet-stream',
        });
    }

    try {
        const response = await axios.post(
            `${env.serverUrl}/api/parser/raw`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'x-parser-token': env.parserToken,
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 30000,
            }
        );

        console.log('✅ [sendDeal] server response:', response.status);

        // 🧹 удаляем временные файлы
        for (const image of images) {
            try {
                await fsPromises.unlink(image.tempPath);
                console.log('🧹 [sendDeal] temp file deleted:', image.tempPath);
            } catch (error) {
                console.error('⚠️ [sendDeal] failed to delete temp file:', image.tempPath, error);
            }
        }

        return response.data;

    } catch (error: any) {
        console.error('❌ [sendDeal] request failed');

        if (error.response) {
            console.error('📥 status:', error.response.status);
            console.error('📥 data:', error.response.data);
        } else if (error.request) {
            console.error('📡 no response received');
        } else {
            console.error('🧨 error:', error.message);
        }

        throw error;
    }
}