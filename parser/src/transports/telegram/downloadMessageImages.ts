import fs from 'node:fs/promises';
import path from 'node:path';
import type { TelegramClient } from 'telegram';
import type { RawMessageImage } from '../../core/types/raw-message.js';

async function ensureDir(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
}

export async function downloadMessageImages(
    client: TelegramClient,
    message: any,
): Promise<RawMessageImage[]> {
    try {
        if (!message?.media) return [];

        const tempDir = path.resolve(process.cwd(), 'storage', 'tmp');
        await ensureDir(tempDir);

        const filename = `tg-${message.id}-${Date.now()}.jpg`;
        const tempPath = path.join(tempDir, filename);

        const result = await client.downloadMedia(message, {
            outputFile: tempPath,
        });

        if (!result) return [];

        return [
            {
                tempPath,
                filename,
                mimeType: 'image/jpeg',
            },
        ];
    } catch (error) {
        console.error('❌ [downloadMessageImages] failed:', error);
        return [];
    }
}