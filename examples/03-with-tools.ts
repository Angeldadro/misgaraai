// examples/03-with-tools.ts
// Ejemplo: Agente con herramientas pre-hechas
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';
import { InMemoryAdapter } from '../src/infrastructure/InMemory.js';
import { CommonTools } from '../src/tools/common.js';

async function main() {
    console.log('=== Ejemplo 3: Agente con Tools (CommonTools) ===\n');

    const memory = new InMemoryAdapter();

    const agent = new AgentBuilder()
        .useModel('gemini-3-flash-preview')
        .setSystem('Eres un asistente que usa herramientas cuando es necesario.')
        .withMemory(memory, 'session-tools')
        .addTools({
            hora: CommonTools.time,
            calcular: CommonTools.calculator,
            aleatorio: CommonTools.randomNumber,
            texto: CommonTools.textUtils,
        });

    // Pregunta que requiere la tool de hora
    console.log('👤 Usuario: ¿Qué hora es?');
    const resp1 = await agent.run('¿Qué hora es?');
    console.log('🤖 IA:', resp1.text);
    console.log('🔧 Tools usadas:', resp1.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    // Pregunta que requiere la calculadora
    console.log('👤 Usuario: ¿Cuánto es 1547 * 23 + 892?');
    const resp2 = await agent.run('¿Cuánto es 1547 * 23 + 892?');
    console.log('🤖 IA:', resp2.text);
    console.log('🔧 Tools usadas:', resp2.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    // Pregunta que requiere número aleatorio
    console.log('👤 Usuario: Dame un número aleatorio entre 1 y 100');
    const resp3 = await agent.run('Dame un número aleatorio entre 1 y 100');
    console.log('🤖 IA:', resp3.text);
    console.log('🔧 Tools usadas:', resp3.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    // Pregunta que requiere utilidades de texto
    console.log('👤 Usuario: ¿Cuántas palabras tiene esta frase: "Hola mundo esto es una prueba de texto largo"?');
    const resp4 = await agent.run('¿Cuántas palabras tiene esta frase: "Hola mundo esto es una prueba de texto largo"?');
    console.log('🤖 IA:', resp4.text);
    console.log('🔧 Tools usadas:', resp4.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
}

main().catch(console.error);
