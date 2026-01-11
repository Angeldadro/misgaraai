// examples/01-basic-chat.ts
// Ejemplo básico: Chat simple sin herramientas
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';

async function main() {
    console.log('=== Ejemplo 1: Chat Básico (sin tools) ===\n');

    const agent = new AgentBuilder()
        .useModel('gemini-3-flash-preview')
        .setSystem('Eres un asistente amable que responde de forma concisa.')
        .setTemperature(0.7);

    // Ejecución stateless (sin memoria)
    const response = await agent.runStateless('Hola, ¿cómo estás? Dame 3 consejos para aprender programación.');

    console.log('🤖 Respuesta:', response.text);
    console.log('\n📊 Uso de tokens:', {
        input: response.usage.inputTokens,
        output: response.usage.outputTokens,
        total: response.usage.totalTokens,
    });
}

main().catch(console.error);
