// examples/08-openai-with-tools.ts
// Ejemplo: OpenAI con herramientas
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';
import { InMemoryAdapter } from '../src/infrastructure/InMemory.js';
import { CommonTools } from '../src/tools/common.js';

async function main() {
    console.log('=== Ejemplo 8: OpenAI con Tools ===\n');

    const memory = new InMemoryAdapter();

    const agent = new AgentBuilder()
        .useOpenAI('gpt-4o-mini')
        .setSystem('Eres un asistente que usa herramientas cuando es necesario.')
        .withMemory(memory, 'session-openai-tools')
        .addTools({
            hora: CommonTools.time,
            calcular: CommonTools.calculator,
            aleatorio: CommonTools.randomNumber,
        });

    // Pregunta que requiere la tool de hora
    console.log('👤 Usuario: ¿Qué hora es?');
    const resp1 = await agent.run('¿Qué hora es?');
    console.log('🤖 IA:', resp1.text);
    console.log('🔧 Tools usadas:', resp1.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    // Pregunta que requiere la calculadora
    console.log('👤 Usuario: ¿Cuánto es 789 * 456?');
    const resp2 = await agent.run('¿Cuánto es 789 * 456?');
    console.log('🤖 IA:', resp2.text);
    console.log('🔧 Tools usadas:', resp2.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    // Pregunta que requiere número aleatorio
    console.log('👤 Usuario: Tira un dado de 20 caras');
    const resp3 = await agent.run('Tira un dado de 20 caras');
    console.log('🤖 IA:', resp3.text);
    console.log('🔧 Tools usadas:', resp3.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
}

main().catch(console.error);
