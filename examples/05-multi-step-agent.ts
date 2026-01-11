// examples/05-multi-step-agent.ts
// Ejemplo: Agente que usa múltiples herramientas en una sola consulta
import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod/v4';
import { AgentBuilder } from '../src/core/AgentBuilder.js';
import { InMemoryAdapter } from '../src/infrastructure/InMemory.js';
import { CommonTools } from '../src/tools/common.js';

async function main() {
    console.log('=== Ejemplo 5: Agente Multi-Step ===\n');

    const memory = new InMemoryAdapter();

    const agent = new AgentBuilder()
        .useModel('gemini-3-flash-preview')
        .setSystem('Eres un asistente que puede combinar múltiples herramientas para resolver problemas complejos.')
        .withMemory(memory, 'session-multistep')
        .setMaxSteps(5) // Permitir hasta 5 pasos de herramientas
        .addTools({
            hora: CommonTools.time,
            calcular: CommonTools.calculator,
            clima: tool({
                description: 'Obtiene el clima actual de una ciudad (simulado)',
                inputSchema: z.object({
                    ciudad: z.string().describe('Nombre de la ciudad'),
                }),
                execute: async ({ ciudad }) => {
                    // Simulación
                    const temperaturas: Record<string, number> = {
                        'madrid': 22,
                        'barcelona': 25,
                        'sevilla': 30,
                        'bilbao': 18,
                    };
                    const temp = temperaturas[ciudad.toLowerCase()] || Math.floor(Math.random() * 20) + 10;
                    return JSON.stringify({
                        ciudad,
                        temperatura: temp,
                        unidad: 'Celsius',
                        condicion: temp > 25 ? 'Soleado' : temp > 15 ? 'Nublado' : 'Frío',
                    });
                },
            }),
            convertirMoneda: tool({
                description: 'Convierte una cantidad de una moneda a otra (tasas simuladas)',
                inputSchema: z.object({
                    cantidad: z.number().describe('Cantidad a convertir'),
                    de: z.string().describe('Moneda origen (USD, EUR, GBP)'),
                    a: z.string().describe('Moneda destino (USD, EUR, GBP)'),
                }),
                execute: async ({ cantidad, de, a }) => {
                    const tasas: Record<string, number> = {
                        'USD-EUR': 0.92,
                        'EUR-USD': 1.09,
                        'USD-GBP': 0.79,
                        'GBP-USD': 1.27,
                        'EUR-GBP': 0.86,
                        'GBP-EUR': 1.16,
                    };
                    const clave = `${de.toUpperCase()}-${a.toUpperCase()}`;
                    const tasa = tasas[clave] || 1;
                    return JSON.stringify({
                        original: { cantidad, moneda: de },
                        convertido: { cantidad: (cantidad * tasa).toFixed(2), moneda: a },
                        tasa,
                    });
                },
            }),
        });

    // Consulta que requiere múltiples herramientas
    console.log('👤 Usuario: ¿Qué hora es, cómo está el clima en Madrid, y si tengo 100 USD cuántos EUR son?');
    const resp = await agent.run('¿Qué hora es, cómo está el clima en Madrid, y si tengo 100 USD cuántos EUR son?');

    console.log('🤖 IA:', resp.text);
    console.log();
    console.log('📊 Detalles de ejecución:');
    console.log('   - Pasos ejecutados:', resp.steps.length);
    console.log('   - Tools usadas:', resp.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log('   - Tokens totales:', resp.usage.totalTokens);
}

main().catch(console.error);
