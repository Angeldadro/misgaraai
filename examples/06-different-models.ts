// examples/06-different-models.ts
// Ejemplo: Usando diferentes modelos
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';

async function main() {
    console.log('=== Ejemplo 6: Diferentes Modelos de Gemini ===\n');

    const prompt = 'Explica en una frase qué es la programación funcional.';

    // Modelo Gemini 3 Flash Preview (más nuevo)
    console.log('📍 Modelo: gemini-3-flash-preview');
    const agent3Flash = new AgentBuilder()
        .useModel('gemini-3-flash-preview')
        .setTemperature(0.3);

    const resp3Flash = await agent3Flash.runStateless(prompt);
    console.log('🤖 Respuesta:', resp3Flash.text);
    console.log('📊 Tokens:', resp3Flash.usage.totalTokens);
    console.log();

    // Modelo Flash 1.5 (rápido y económico)
    console.log('📍 Modelo: gemini-1.5-flash');
    const agentFlash = new AgentBuilder()
        .useModel('gemini-1.5-flash')
        .setTemperature(0.3);

    const respFlash = await agentFlash.runStateless(prompt);
    console.log('🤖 Respuesta:', respFlash.text);
    console.log('📊 Tokens:', respFlash.usage.totalTokens);
}

main().catch(console.error);
