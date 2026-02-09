// examples/11-media-ocr-whisper.ts
// Ejemplo: OCR con DeepSeek y transcripcion de audio con Whisper
import 'dotenv/config';
import { MediaBuilder } from '../src/core/MediaBuilder.js';

async function main() {
    console.log('=== Ejemplo 11: DeepSeek OCR + OpenAI Whisper ===\n');

    const media = new MediaBuilder()
        .useDeepSeekOCR('deepseek-ai/DeepSeek-OCR')
        .useOpenAIWhisper('whisper-1');

    // OCR (usa URL o data URL/base64)
    const ocrResult = await media.extractTextFromImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/ReceiptSwiss.jpg/640px-ReceiptSwiss.jpg',
        'Extrae el texto del recibo y devuelve solo el contenido textual.'
    );
    console.log('OCR texto:\n', ocrResult.text);
    console.log('OCR tokens:', ocrResult.usage.totalTokens);

    // Transcripcion (usa URL o data URL/base64)
    const transcription = await media.transcribeAudio(
        'https://cdn.openai.com/API/docs/audio/alloy.wav'
    );
    console.log('\nTranscripcion:\n', transcription.text);
    console.log('Idioma detectado:', transcription.language || 'desconocido');
}

main().catch(console.error);
