// examples/02-with-memory.ts
// Ejemplo: Chat con memoria (usando InMemoryAdapter)
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';
import { InMemoryAdapter } from '../src/infrastructure/InMemory.js';

async function main() {
    console.log('=== Ejemplo 2: Chat con Memoria (InMemory) ===\n');

    const memory = new InMemoryAdapter();
    const sessionId = 'usuario-test-123';

    const agent = new AgentBuilder()
        .useModel('gemini-3-flash-preview')
        .setSystem('Eres un tutor de matemáticas. Recuerda lo que el estudiante te dice.')
        .withMemory(memory, sessionId)
        .setTemperature(0.5);

    // Primera pregunta
    console.log('👤 Usuario: Mi nombre es Carlos y tengo 15 años');
    const resp1 = await agent.run('Mi nombre es Carlos y tengo 15 años');
    console.log('🤖 IA:', resp1.text);
    console.log();

    // Segunda pregunta (debería recordar el nombre)
    console.log('👤 Usuario: ¿Cómo me llamo y cuántos años tengo?');
    const resp2 = await agent.run('¿Cómo me llamo y cuántos años tengo?');
    console.log('🤖 IA:', resp2.text);
    console.log();

    // Tercera pregunta (contexto acumulado)
    console.log('👤 Usuario: Explícame qué es un número primo en un nivel adecuado para mi edad');
    const resp3 = await agent.run('Explícame qué es un número primo en un nivel adecuado para mi edad');
    console.log('🤖 IA:', resp3.text);

    console.log('\n📊 Tokens totales en la última respuesta:', resp3.usage.totalTokens);
}

main().catch(console.error);
