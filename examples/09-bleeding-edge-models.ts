// examples/09-bleeding-edge-models.ts
// Ejemplo: Usando los modelos más nuevos de 2026 (GPT-5, o3)
import 'dotenv/config';
import { AgentBuilder } from '../src/core/AgentBuilder.js';

async function main() {
    console.log('=== Ejemplo 9: Modelos Bleeding Edge (2026) ===\n');

    // 1. GPT-5 Nano: La opción más económica
    console.log('📍 Modelo: gpt-5-nano (Opción "Best Price")');
    const agentNano = new AgentBuilder()
        .useOpenAI('gpt-5-nano')
        .setSystem('Eres un asistente rápido y ultra-eficiente.');

    try {
        const respNano = await agentNano.runStateless('Resume brevemente los beneficios de la computación cuántica.');
        console.log('🤖 Respuesta:', respNano.text);
        console.log('📊 Tokens:', respNano.usage.totalTokens);
    } catch (e: any) {
        console.log('⚠️ Error (posiblemente falta acceso a la beta):', e.message);
    }
    console.log();

    // 2. o3-mini: Razonamiento avanzado a bajo costo
    console.log('📍 Modelo: o3-mini (Razonamiento Rápido)');
    const agentO3 = new AgentBuilder()
        .useOpenAI('o3-mini')
        .setSystem('Eres un experto en lógica.');

    try {
        const respO3 = await agentO3.runStateless('Si tengo 3 manzanas y me comes 1, ¿cuántas quedan? Explica paso a paso.');
        console.log('🤖 Respuesta:', respO3.text);
        console.log('📊 Tokens:', respO3.usage.totalTokens);
    } catch (e: any) {
        console.log('⚠️ Error:', e.message);
    }
}

main().catch(console.error);
