// src/core/types.ts
import type { ModelMessage, LanguageModelUsage } from 'ai';

/**
 * Interface for memory adapters (Port)
 * Allows the agent to persist conversation history
 */
export interface IMemoryAdapter {
    /**
     * Retrieves conversation history for a session
     */
    get(sessionId: string): Promise<ModelMessage[]>;

    /**
     * Adds/updates messages in the conversation history
     */
    add(sessionId: string, messages: ModelMessage[]): Promise<void>;

    /**
     * Clears all conversation history for a session
     */
    clear(sessionId: string): Promise<void>;
}

/**
 * Tool call information
 */
export interface ToolCallInfo {
    toolName: string;
    input: unknown;
}

/**
 * Tool result information  
 */
export interface ToolResultInfo {
    toolName: string;
    output: unknown;
}

/**
 * Step information for debugging
 */
export interface StepInfo {
    toolCalls: ToolCallInfo[];
    toolResults: ToolResultInfo[];
    text: string;
    finishReason: string;
}

/**
 * Result returned from agent execution
 */
export interface AgentResult {
    /** The final text response from the agent */
    text: string;
    /** Details about each step taken (useful for debugging tool usage) */
    steps: StepInfo[];
    /** Token usage statistics */
    usage: {
        inputTokens: number | undefined;
        outputTokens: number | undefined;
        totalTokens: number | undefined;
    };
    /** Total usage across all steps */
    totalUsage: LanguageModelUsage;
}

/**
 * Shared binary/text input format used by OCR and audio transcription.
 */
export type MediaInput = string | URL | Uint8Array | ArrayBuffer | Buffer;

/**
 * OCR extraction result.
 */
export interface OCRResult {
    /** Extracted text from the input image */
    text: string;
    /** Token usage statistics */
    usage: {
        inputTokens: number | undefined;
        outputTokens: number | undefined;
        totalTokens: number | undefined;
    };
    /** Total usage across the OCR call */
    totalUsage: LanguageModelUsage;
}

/**
 * Audio transcription result (Whisper/OpenAI Transcription API).
 */
export interface AudioTranscriptionResult {
    text: string;
    segments: Array<{
        text: string;
        startSecond: number;
        endSecond: number;
    }>;
    language: string | undefined;
    durationInSeconds: number | undefined;
}
