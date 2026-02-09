import { generateText, streamText, stepCountIs, type ModelMessage, type ToolSet, type LanguageModel, type StopCondition, type StreamTextResult } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { deepinfra } from '@ai-sdk/deepinfra';
import type { IMemoryAdapter, AgentResult, StepInfo, ToolCallInfo, ToolResultInfo } from './types.js';

// Model type definitions
type GeminiModel = 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'gemini-3-flash-preview';
type OpenAIModel =
    | 'gpt-4o' | 'gpt-4o-mini'
    | 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'gpt-5.2'
    | 'o1' | 'o1-mini'
    | 'o3' | 'o3-mini' | 'o3-pro'
    | 'o4-mini';

type DeepSeekModel =
    | 'deepseek-ai/DeepSeek-OCR'
    | 'deepseek-ai/DeepSeek-V3'
    | 'deepseek-ai/DeepSeek-R1'
    | 'deepseek-ai/DeepSeek-V3.2';

/**
 * AgentBuilder - Fluent interface for building AI agents
 * Supports Google Gemini, OpenAI, and DeepSeek models
 * 
 * @example
 * // Using Gemini
 * const agent = new AgentBuilder()
 *   .useGemini('gemini-3-flash-preview')
 *   .setSystem('You are a helpful assistant.')
 *   .addTools({ time: CommonTools.time });
 * 
 * // Using OpenAI
 * const agent = new AgentBuilder()
 *   .useOpenAI('gpt-4o-mini')
 *   .setSystem('You are a helpful assistant.')
 *   .addTools({ time: CommonTools.time });
 * 
 * const result = await agent.run('Hello!');
 * console.log(result.text);
 */
export class AgentBuilder {
    private model: LanguageModel = google('gemini-3-flash-preview');
    private systemPrompt = 'Eres un asistente útil y directo.';
    private tools: ToolSet = {};
    private memory?: IMemoryAdapter;
    private sessionId?: string;
    private maxSteps = 1;
    private temperature = 0.5;
    private maxOutputTokens?: number;

    // --- CONFIGURATION (Fluent Interface) ---

    /**
     * Sets a Google Gemini model
     */
    useGemini(modelId: GeminiModel): this {
        this.model = google(modelId);
        return this;
    }

    /**
     * Sets an OpenAI model
     */
    useOpenAI(modelId: OpenAIModel): this {
        this.model = openai(modelId);
        return this;
    }

    /**
     * Sets a DeepSeek model via DeepInfra
     * Uses DEEPINFRA_API_KEY from environment variables automatically
     */
    useDeepSeek(modelId: DeepSeekModel): this {
        this.model = deepinfra(modelId);
        return this;
    }

    /**
     * Shortcut for DeepSeek OCR model via DeepInfra
     */
    useDeepSeekOCR(): this {
        return this.useDeepSeek('deepseek-ai/DeepSeek-OCR');
    }

    /**
     * @deprecated Use useGemini() instead
     * Sets the Gemini model to use (legacy method)
     */
    useModel(modelId: GeminiModel): this {
        return this.useGemini(modelId);
    }

    /**
     * Sets a custom LanguageModel (for other providers like Anthropic, Mistral, etc.)
     */
    useCustomModel(model: LanguageModel): this {
        this.model = model;
        return this;
    }

    /**
     * Sets the system prompt
     */
    setSystem(prompt: string): this {
        this.systemPrompt = prompt;
        return this;
    }

    /**
     * Configures memory persistence for conversation history
     */
    withMemory(adapter: IMemoryAdapter, sessionId: string): this {
        this.memory = adapter;
        this.sessionId = sessionId;
        return this;
    }

    /**
     * Adds tools to the agent (enables agentic behavior with multiple steps)
     * Can be called multiple times to add more tools
     */
    addTools(tools: ToolSet): this {
        this.tools = { ...this.tools, ...tools };
        // If adding tools, enable agentic behavior
        if (this.maxSteps === 1) {
            this.maxSteps = 10;
        }
        return this;
    }

    /**
     * Sets the temperature for generation (0-2)
     */
    setTemperature(temp: number): this {
        this.temperature = Math.max(0, Math.min(2, temp));
        return this;
    }

    /**
     * Sets maximum steps for tool call loops
     * Higher values allow more complex multi-step operations
     */
    setMaxSteps(steps: number): this {
        this.maxSteps = Math.max(1, steps);
        return this;
    }

    /**
     * Sets maximum output tokens for generation
     */
    setMaxOutputTokens(tokens: number): this {
        this.maxOutputTokens = tokens;
        return this;
    }

    // --- PRIVATE HELPERS ---
    private createUserMessage(userPrompt: string, imageUrl?: string): ModelMessage {
        return {
            role: 'user',
            content: imageUrl
                ? [
                    { type: 'text', text: userPrompt },
                    { type: 'image', image: imageUrl },
                ]
                : userPrompt,
        };
    }

    private formatStepResult(steps: Array<{
        text: string;
        finishReason: string;
        toolCalls: Array<{ toolName: string; input: unknown }>;
        toolResults: Array<{ toolName: string; output: unknown }>;
    }>): StepInfo[] {
        return steps.map((step) => ({
            text: step.text,
            finishReason: step.finishReason,
            toolCalls: step.toolCalls.map((tc): ToolCallInfo => ({
                toolName: tc.toolName,
                input: tc.input,
            })),
            toolResults: step.toolResults.map((tr): ToolResultInfo => ({
                toolName: tr.toolName,
                output: tr.output,
            })),
        }));
    }

    // --- EXECUTION ---

    /**
     * Runs the agent with a user prompt
     * @param userPrompt - The user's message
     * @param imageUrl - Optional image URL or base64 for multimodal input
     */
    async run(userPrompt: string, imageUrl?: string): Promise<AgentResult> {
        // 1. Load History
        let history: ModelMessage[] = [];
        if (this.memory && this.sessionId) {
            history = await this.memory.get(this.sessionId);
        }

        // 2. Prepare Current Message (supports multimodal)
        const currentMessage = this.createUserMessage(userPrompt, imageUrl);

        // 3. Call AI SDK with generateText
        // In v6, stopWhen with stepCountIs controls the multi-step behavior
        const hasTools = Object.keys(this.tools).length > 0;

        const result = await generateText({
            model: this.model,
            system: this.systemPrompt,
            messages: [...history, currentMessage],
            tools: hasTools ? this.tools : undefined,
            stopWhen: hasTools ? stepCountIs(this.maxSteps) as StopCondition<ToolSet> : undefined,
            temperature: this.temperature,
            maxOutputTokens: this.maxOutputTokens,
        });

        // 4. Save Updated History
        // result.response.messages contains all new messages (responses, tool calls, tool results)
        if (this.memory && this.sessionId) {
            const updatedHistory = [...history, currentMessage, ...result.response.messages];
            await this.memory.add(this.sessionId, updatedHistory);
        }

        // 5. Format and return result
        return {
            text: result.text,
            steps: this.formatStepResult(result.steps),
            usage: {
                inputTokens: result.usage.inputTokens,
                outputTokens: result.usage.outputTokens,
                totalTokens: result.usage.totalTokens,
            },
            totalUsage: result.usage,
        };
    }

    /**
     * Runs the agent without saving to memory (stateless)
     */
    async runStateless(userPrompt: string, imageUrl?: string): Promise<AgentResult> {
        const currentMessage = this.createUserMessage(userPrompt, imageUrl);

        const hasTools = Object.keys(this.tools).length > 0;

        const result = await generateText({
            model: this.model,
            system: this.systemPrompt,
            messages: [currentMessage],
            tools: hasTools ? this.tools : undefined,
            stopWhen: hasTools ? stepCountIs(this.maxSteps) as StopCondition<ToolSet> : undefined,
            temperature: this.temperature,
            maxOutputTokens: this.maxOutputTokens,
        });

        return {
            text: result.text,
            steps: this.formatStepResult(result.steps),
            usage: {
                inputTokens: result.usage.inputTokens,
                outputTokens: result.usage.outputTokens,
                totalTokens: result.usage.totalTokens,
            },
            totalUsage: result.usage,
        };
    }

    /**
     * Runs the agent in Streaming mode
     * Automatically saves history on finish
     */
    async stream(userPrompt: string, imageUrl?: string): Promise<StreamTextResult<ToolSet, any>> {
        // 1. Load History
        let history: ModelMessage[] = [];
        if (this.memory && this.sessionId) {
            history = await this.memory.get(this.sessionId);
        }

        // 2. Prepare Current Message
        const currentMessage = this.createUserMessage(userPrompt, imageUrl);

        const hasTools = Object.keys(this.tools).length > 0;

        // 3. Start Stream
        const result = streamText({
            model: this.model,
            system: this.systemPrompt,
            messages: [...history, currentMessage],
            tools: hasTools ? this.tools : undefined,
            stopWhen: hasTools ? stepCountIs(this.maxSteps) as StopCondition<ToolSet> : undefined,
            temperature: this.temperature,
            maxOutputTokens: this.maxOutputTokens,

            // Callback for persistence
            onFinish: async ({ response }) => {
                if (this.memory && this.sessionId) {
                    // response.messages includes the full roundtrip (tool calls, results, final response)
                    const updatedHistory = [...history, currentMessage, ...response.messages];
                    await this.memory.add(this.sessionId, updatedHistory);
                }
            },
        });

        return result;
    }

    /**
     * Stateless version of Streaming (no persistence)
     */
    async streamStateless(userPrompt: string, imageUrl?: string): Promise<StreamTextResult<ToolSet, any>> {
        const currentMessage = this.createUserMessage(userPrompt, imageUrl);

        const hasTools = Object.keys(this.tools).length > 0;

        return streamText({
            model: this.model,
            system: this.systemPrompt,
            messages: [currentMessage],
            tools: hasTools ? this.tools : undefined,
            stopWhen: hasTools ? stepCountIs(this.maxSteps) as StopCondition<ToolSet> : undefined,
            temperature: this.temperature,
            maxOutputTokens: this.maxOutputTokens,
        });
    }
}
