// examples/10-streaming.ts
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';
import { InMemoryAdapter } from '../src/infrastructure/InMemory.js';

async function main() {
    console.log('=== Ejemplo 10: Streaming ===');

    // Usamos InMemory para ver como se guarda el historial al final
    const memory = new InMemoryAdapter();
    const sessionId = 'stream-session-1';

    const agent = new AgentBuilder()
        // Usamos un modelo rápido para streaming
        .useOpenAI('gpt-4o-mini')
        .withMemory(memory, sessionId)
        // Sistema que pida respuestas largas para ver el efecto stream
        .setSystem('Eres un poeta. Responde siempre con un poema de al menos 4 estrofas.');

    console.log('👤 Usuario: Escribe un poema sobre el código limpio (Clean Code).');
    console.log('🤖 IA (Streaming):');

    // Ejecutamos el modo stream
    const result = await agent.stream('Escribe un poema sobre el código limpio.');

    // Iteramos sobre el flujo de texto
    for await (const textPart of result.textStream) {
        process.stdout.write(textPart);
    }

    console.log('\n\n--- Fin del Stream ---');

    // Verificamos que se haya guardado en memoria
    const history = await memory.get(sessionId);
    console.log(`\n📚 Historial guardado: ${history.length} mensajes.`);
    console.log(`   (Usuario + Respuesta completa)`);
}

main().catch(console.error);
