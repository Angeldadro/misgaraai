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
