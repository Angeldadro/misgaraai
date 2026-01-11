// src/infrastructure/InMemory.ts
import type { ModelMessage } from 'ai';
import type { IMemoryAdapter } from '../core/types.js';

/**
 * In-memory adapter for development/testing (no external dependencies)
 */
export class InMemoryAdapter implements IMemoryAdapter {
    private store = new Map<string, ModelMessage[]>();
    private maxMessages: number;

    constructor(options?: { maxMessages?: number }) {
        this.maxMessages = options?.maxMessages || 30;
    }

    async get(sessionId: string): Promise<ModelMessage[]> {
        return this.store.get(sessionId) || [];
    }

    async add(sessionId: string, messages: ModelMessage[]): Promise<void> {
        this.store.set(sessionId, messages.slice(-this.maxMessages));
    }

    async clear(sessionId: string): Promise<void> {
        this.store.delete(sessionId);
    }

    /**
     * Clears all stored sessions
     */
    clearAll(): void {
        this.store.clear();
    }
}
