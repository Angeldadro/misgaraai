// examples/07-openai-basic.ts
// Ejemplo: Chat básico con OpenAI
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';

async function main() {
    console.log('=== Ejemplo 7: Chat con OpenAI ===\n');

    const agent = new AgentBuilder()
        .useOpenAI('gpt-4o-mini') // Modelo económico de OpenAI
        .setSystem('Eres un asistente amable que responde de forma concisa.')
        .setTemperature(0.7);

    // Ejecución stateless (sin memoria)
    const response = await agent.runStateless('Hola, ¿qué puedes hacer por mí? Dame una respuesta corta.');

    console.log('🤖 Respuesta:', response.text);
    console.log('\n📊 Uso de tokens:', {
        input: response.usage.inputTokens,
        output: response.usage.outputTokens,
        total: response.usage.totalTokens,
    });
}

main().catch(console.error);
