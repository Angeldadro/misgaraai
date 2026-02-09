import { experimental_transcribe as transcribe, generateText, type LanguageModel, type TranscriptionModel } from 'ai';
import { deepinfra } from '@ai-sdk/deepinfra';
import { openai } from '@ai-sdk/openai';
import type { AudioTranscriptionResult, MediaInput, OCRResult } from './types.js';

type DeepSeekOCRModel = 'deepseek-ai/DeepSeek-OCR' | (string & {});
type OpenAIWhisperModel = 'whisper-1' | 'gpt-4o-mini-transcribe' | 'gpt-4o-transcribe';

/**
 * MediaBuilder - Fluent interface for OCR and audio transcription tasks.
 * Keeps media workflows separated from the conversational AgentBuilder.
 */
export class MediaBuilder {
    private ocrModel: LanguageModel = deepinfra('deepseek-ai/DeepSeek-OCR');
    private transcriptionModel: TranscriptionModel = openai.transcription('whisper-1');
    private ocrSystemPrompt = 'Eres un motor OCR preciso. Extrae texto fielmente, sin inventar contenido.';
    private ocrTemperature = 0;
    private ocrMaxOutputTokens = 1200;

    private normalizeMediaInput(input: MediaInput): MediaInput | URL {
        if (typeof input !== 'string') {
            return input;
        }

        const trimmed = input.trim();
        if (/^https?:\/\//i.test(trimmed)) {
            try {
                return new URL(trimmed);
            } catch {
                return input;
            }
        }

        return input;
    }

    /**
     * Sets a DeepSeek OCR model via DeepInfra.
     */
    useDeepSeekOCR(modelId: DeepSeekOCRModel = 'deepseek-ai/DeepSeek-OCR'): this {
        this.ocrModel = deepinfra(modelId);
        return this;
    }

    /**
     * Sets an OpenAI Whisper/transcription model.
     */
    useOpenAIWhisper(modelId: OpenAIWhisperModel = 'whisper-1'): this {
        this.transcriptionModel = openai.transcription(modelId);
        return this;
    }

    /**
     * Sets a custom OCR language model.
     */
    useCustomOCRModel(model: LanguageModel): this {
        this.ocrModel = model;
        return this;
    }

    /**
     * Sets a custom transcription model.
     */
    useCustomTranscriptionModel(model: TranscriptionModel): this {
        this.transcriptionModel = model;
        return this;
    }

    /**
     * Sets the OCR system prompt.
     */
    setOCRSystem(prompt: string): this {
        this.ocrSystemPrompt = prompt;
        return this;
    }

    /**
     * Sets OCR temperature (0-2). Defaults to 0 for deterministic extraction.
     */
    setOCRTemperature(temp: number): this {
        this.ocrTemperature = Math.max(0, Math.min(2, temp));
        return this;
    }

    /**
     * Sets OCR max output tokens.
     */
    setOCRMaxOutputTokens(tokens: number): this {
        this.ocrMaxOutputTokens = Math.max(64, Math.floor(tokens));
        return this;
    }

    /**
     * Extracts text from an image using the configured OCR model.
     * Accepts URL, data URL/base64, or binary data.
     */
    async extractTextFromImage(
        image: MediaInput,
        prompt = 'Extrae todo el texto visible exactamente como aparece. Conserva saltos de linea cuando sea posible.'
    ): Promise<OCRResult> {
        const normalizedImage = this.normalizeMediaInput(image);

        const result = await generateText({
            model: this.ocrModel,
            system: this.ocrSystemPrompt,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image', image: normalizedImage },
                    ],
                },
            ],
            temperature: this.ocrTemperature,
            maxOutputTokens: this.ocrMaxOutputTokens,
        });

        return {
            text: result.text,
            usage: {
                inputTokens: result.usage.inputTokens,
                outputTokens: result.usage.outputTokens,
                totalTokens: result.usage.totalTokens,
            },
            totalUsage: result.usage,
        };
    }

    /**
     * Transcribes audio to text using the configured transcription model (Whisper by default).
     * Accepts URL, data URL/base64, or binary data.
     */
    async transcribeAudio(audio: MediaInput): Promise<AudioTranscriptionResult> {
        const normalizedAudio = this.normalizeMediaInput(audio);

        return transcribe({
            model: this.transcriptionModel,
            audio: normalizedAudio,
        });
    }
}
