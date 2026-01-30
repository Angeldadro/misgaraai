// src/tools/common.ts
import { tool } from 'ai';
import { z } from 'zod/v4';
import { evaluate } from 'mathjs';

/**
 * Collection of pre-built common tools
 */
export const CommonTools = {
    /**
     * Tool 1: Current date and time
     */
    time: tool({
        description: 'Obtiene la fecha y hora actual (útil para contextos temporales)',
        inputSchema: z.object({}),
        execute: async () => {
            const now = new Date();
            return JSON.stringify({
                iso: now.toISOString(),
                local: now.toLocaleString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
        },
    }),

    // Tool 2: Safe calculator using mathjs
    calculator: tool({
        description: 'Realiza cálculos matemáticos seguros. Soporta +, -, *, /, potencias y funciones básicas.',
        inputSchema: z.object({
            expression: z.string().describe('La expresión matemática a evaluar, ej: "2 + 2", "sqrt(16)", o "(10 * 5) / 2"'),
        }),
        execute: async ({ expression }: { expression: string }) => {
            try {
                // evaluate from mathjs is safer and more powerful
                const result = evaluate(expression);
                return JSON.stringify({ result: result.toString(), expression });
            } catch {
                return JSON.stringify({ error: 'Error en el cálculo: Expresión inválida o no soportada', result: null });
            }
        },
    }),

    /**
     * Tool 3: Web search mock (replace with actual API in production)
     */
    webSearchMock: tool({
        description: 'Busca información actual en internet sobre un tópico',
        inputSchema: z.object({
            query: z.string().describe('El término o frase a buscar'),
        }),
        execute: async ({ query }: { query: string }) => {
            console.log(`[🔍 Buscando en la web: ${query}]`);
            // Mock response - replace with actual search API (SerpAPI, Tavily, etc.)
            return JSON.stringify({
                query,
                results: [
                    { title: 'Resultado simulado 1', snippet: `Información sobre: ${query}` },
                    { title: 'Resultado simulado 2', snippet: 'El clima está soleado en Madrid.' },
                    { title: 'Resultado simulado 3', snippet: 'El dólar está a 1.05 EUR.' },
                ],
                note: 'Esto es una respuesta simulada. Implementa una API real en producción.',
            });
        },
    }),

    /**
     * Tool 4: Random number generator
     */
    randomNumber: tool({
        description: 'Genera un número aleatorio entre un mínimo y máximo',
        inputSchema: z.object({
            min: z.number().describe('Valor mínimo (incluido)'),
            max: z.number().describe('Valor máximo (incluido)'),
        }),
        execute: async ({ min, max }: { min: number; max: number }) => {
            const result = Math.floor(Math.random() * (max - min + 1)) + min;
            return JSON.stringify({ min, max, result });
        },
    }),

    /**
     * Tool 5: Text utilities
     */
    textUtils: tool({
        description: 'Realiza operaciones de texto: contar palabras, caracteres, o transformar texto',
        inputSchema: z.object({
            text: z.string().describe('El texto a procesar'),
            operation: z.enum(['wordCount', 'charCount', 'uppercase', 'lowercase', 'reverse'])
                .describe('La operación a realizar'),
        }),
        execute: async ({ text, operation }: { text: string; operation: string }) => {
            switch (operation) {
                case 'wordCount':
                    return JSON.stringify({ operation, result: text.split(/\s+/).filter((w) => w.length > 0).length });
                case 'charCount':
                    return JSON.stringify({ operation, result: text.length });
                case 'uppercase':
                    return JSON.stringify({ operation, result: text.toUpperCase() });
                case 'lowercase':
                    return JSON.stringify({ operation, result: text.toLowerCase() });
                case 'reverse':
                    return JSON.stringify({ operation, result: text.split('').reverse().join('') });
                default:
                    return JSON.stringify({ operation, error: 'Operación no reconocida' });
            }
        },
    }),
};
