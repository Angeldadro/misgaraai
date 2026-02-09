import 'dotenv/config';
import { MediaBuilder } from './core/MediaBuilder.js';

const DEFAULT_IMAGE_URL =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/ReceiptSwiss.jpg/640px-ReceiptSwiss.jpg';
const DEFAULT_AUDIO_URL = 'https://cdn.openai.com/API/docs/audio/alloy.wav';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        throw new Error(
            `Falta la variable de entorno ${name}. Configurala en tu .env antes de correr el demo.`
        );
    }
    return value;
}

async function main() {
    // Required credentials for this demo:
    // - DEEPINFRA_API_KEY for DeepSeek OCR
    // - OPENAI_API_KEY for Whisper transcription
    requireEnv('DEEPINFRA_API_KEY');
    requireEnv('OPENAI_API_KEY');

    const imageInput = process.argv[2] ?? DEFAULT_IMAGE_URL;
    const audioInput = process.argv[3] ?? DEFAULT_AUDIO_URL;

    console.log('=== Demo Media: DeepSeek OCR + OpenAI Whisper ===');
    console.log(`Imagen: ${imageInput}`);
    console.log(`Audio : ${audioInput}`);
    console.log();

    const media = new MediaBuilder()
        .useDeepSeekOCR('deepseek-ai/DeepSeek-OCR')
        .useOpenAIWhisper('whisper-1')
        .setOCRMaxOutputTokens(1200);

    console.log('[1/2] Ejecutando OCR...');
    const ocr = await media.extractTextFromImage(
        imageInput,
        'Extrae texto en orden de lectura. Devuelve solo el contenido textual y no repitas lineas.'
    );
    console.log('OCR OK');
    console.log(`Tokens OCR: ${ocr.usage.totalTokens ?? 'n/a'}`);
    console.log('Texto OCR (primeros 700 chars):');
    console.log(ocr.text.slice(0, 700));
    console.log();

    console.log('[2/2] Ejecutando transcripcion de audio...');
    const transcription = await media.transcribeAudio(audioInput);
    console.log('Transcripcion OK');
    console.log(`Idioma detectado: ${transcription.language ?? 'n/a'}`);
    console.log(`Duracion (s): ${transcription.durationInSeconds ?? 'n/a'}`);
    console.log('Texto transcrito (primeros 700 chars):');
    console.log(transcription.text.slice(0, 700));
}

main().catch((err) => {
    console.error('Demo fallido:', err instanceof Error ? err.message : err);
    process.exit(1);
});
