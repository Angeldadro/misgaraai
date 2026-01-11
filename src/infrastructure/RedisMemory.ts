// src/infrastructure/RedisMemory.ts
import { Redis } from 'ioredis';
import type { ModelMessage } from 'ai';
import type { IMemoryAdapter } from '../core/types.js';

/**
 * Redis-based memory adapter for conversation persistence
 */
export class RedisMemory implements IMemoryAdapter {
    private client: Redis;
    private keyPrefix: string;
    private maxMessages: number;
    private ttlSeconds: number;

    constructor(options?: {
        connectionString?: string;
        keyPrefix?: string;
        maxMessages?: number;
        ttlSeconds?: number;
    }) {
        this.client = new Redis(options?.connectionString || 'redis://localhost:6379');
        this.keyPrefix = options?.keyPrefix || 'agent';
        this.maxMessages = options?.maxMessages || 30;
        this.ttlSeconds = options?.ttlSeconds || 86400; // 24 hours default
    }

    private getKey(sessionId: string): string {
        return `${this.keyPrefix}:${sessionId}`;
    }

    async get(sessionId: string): Promise<ModelMessage[]> {
        const data = await this.client.get(this.getKey(sessionId));
        return data ? JSON.parse(data) : [];
    }

    async add(sessionId: string, newMessages: ModelMessage[]): Promise<void> {
        // Keep only the last N messages (sliding window for context management)
        const serialized = JSON.stringify(newMessages.slice(-this.maxMessages));
        await this.client.set(this.getKey(sessionId), serialized, 'EX', this.ttlSeconds);
    }

    async clear(sessionId: string): Promise<void> {
        await this.client.del(this.getKey(sessionId));
    }

    /**
     * Gracefully close the Redis connection
     */
    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}
