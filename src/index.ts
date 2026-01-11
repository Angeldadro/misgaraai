// src/index.ts - Example usage of the AI Agent Library
import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod/v4';
import { AgentBuilder } from './core/AgentBuilder.js';
import { RedisMemory } from './infrastructure/RedisMemory.js';
import { InMemoryAdapter } from './infrastructure/InMemory.js';
import { CommonTools } from './tools/common.js';

async function main() {
    const userId = 'usuario-dev-01';

    // Choose your memory adapter:
    // Option 1: Redis (requires Redis running)
    // const memory = new RedisMemory();

    // Option 2: In-Memory (for development, no external deps)
    const memory = new InMemoryAdapter();

    // Build the agent with fluent interface
    const agent = new AgentBuilder()
        .useModel('gemini-3-flash-preview')
        .setSystem('Eres un asistente financiero sarcástico pero muy útil.')
        .withMemory(memory, userId)
        .setTemperature(0.7)

        // 1. Inject pre-built common tools
        .addTools({
            hora: CommonTools.time,
            web: CommonTools.webSearchMock,
            calcular: CommonTools.calculator,
        })

        // 2. Inject an ad-hoc project-specific tool
        .addTools({
            comprarCripto: tool({
                description: 'Compra una criptomoneda específica',
                inputSchema: z.object({
                    moneda: z.string().describe('El símbolo de la criptomoneda (BTC, ETH, etc.)'),
                    cantidad: z.number().describe('La cantidad a comprar'),
                }),
                execute: async ({ moneda, cantidad }) => {
                    // Simulated order - replace with actual exchange API
                    const orderId = Math.random().toString(36).substring(7);
                    return JSON.stringify({
                        success: true,
                        orderId,
                        message: `Orden de compra creada: ${cantidad} ${moneda.toUpperCase()}`,
                        estimatedPrice: `$${(Math.random() * 50000 + 20000).toFixed(2)} USD`,
                    });
                },
            }),
        });

    console.log('--- 🤖 Inicio del Chat ---\n');

    // Prompt 1: Requires web search and time
    console.log('👤 Usuario: Hola, ¿qué hora es y busca en internet a cuánto está el Bitcoin hoy?');
    const resp1 = await agent.run(
        'Hola, ¿qué hora es y busca en internet a cuánto está el Bitcoin hoy?'
    );
    console.log('🤖 IA:', resp1.text);
    console.log('📊 Tokens usados:', resp1.usage.totalTokens);
    console.log('🔧 Tools usadas:', resp1.steps.flatMap((s) => s.toolCalls.map((t) => t.toolName)).join(', ') || 'ninguna');
    console.log();

    // Prompt 2: Context + new tool (Buy crypto)
    // Thanks to memory, the agent knows we were talking about Bitcoin
    console.log('👤 Usuario: Ok, compra 5 unidades de esa moneda entonces.');
    const resp2 = await agent.run(
        'Ok, compra 5 unidades de esa moneda entonces.'
    );
    console.log('🤖 IA:', resp2.text);
    console.log('📊 Tokens usados:', resp2.usage.totalTokens);
    console.log('🔧 Tools usadas:', resp2.steps.flatMap((s) => s.toolCalls.map((t) => t.toolName)).join(', ') || 'ninguna');
    console.log();

    // Prompt 3: Using calculator
    console.log('👤 Usuario: Si compré a $45000, ¿cuánto gasto en total?');
    const resp3 = await agent.run(
        'Si compré a $45000, ¿cuánto gasto en total por las 5 unidades?'
    );
    console.log('🤖 IA:', resp3.text);
    console.log('📊 Tokens usados:', resp3.usage.totalTokens);
    console.log('🔧 Tools usadas:', resp3.steps.flatMap((s) => s.toolCalls.map((t) => t.toolName)).join(', ') || 'ninguna');

    console.log('\n--- ✅ Chat Finalizado ---');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
});
