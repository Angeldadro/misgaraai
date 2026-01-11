// examples/04-custom-tools.ts
// Ejemplo: Creando herramientas personalizadas
import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod/v4';
import { AgentBuilder } from '../src/core/AgentBuilder.js';
import { InMemoryAdapter } from '../src/infrastructure/InMemory.js';

// Base de datos simulada
const productos = [
    { id: 1, nombre: 'Laptop', precio: 999, stock: 5 },
    { id: 2, nombre: 'Mouse', precio: 29, stock: 50 },
    { id: 3, nombre: 'Teclado', precio: 79, stock: 30 },
    { id: 4, nombre: 'Monitor', precio: 299, stock: 10 },
];

const carrito: { productoId: number; cantidad: number }[] = [];

async function main() {
    console.log('=== Ejemplo 4: Tools Personalizadas (E-commerce) ===\n');

    const memory = new InMemoryAdapter();

    const agent = new AgentBuilder()
        .useModel('gemini-3-flash-preview')
        .setSystem('Eres un asistente de tienda online. Ayudas a los clientes a buscar productos y hacer compras.')
        .withMemory(memory, 'session-ecommerce')

        // Tools personalizadas para e-commerce
        .addTools({
            buscarProducto: tool({
                description: 'Busca productos en el catálogo por nombre',
                inputSchema: z.object({
                    query: z.string().describe('Término de búsqueda'),
                }),
                execute: async ({ query }) => {
                    const resultados = productos.filter(p =>
                        p.nombre.toLowerCase().includes(query.toLowerCase())
                    );
                    return JSON.stringify({
                        encontrados: resultados.length,
                        productos: resultados,
                    });
                },
            }),

            verCarrito: tool({
                description: 'Muestra el contenido actual del carrito de compras',
                inputSchema: z.object({}),
                execute: async () => {
                    const items = carrito.map(item => {
                        const producto = productos.find(p => p.id === item.productoId);
                        return {
                            ...item,
                            nombre: producto?.nombre,
                            precioUnitario: producto?.precio,
                            subtotal: (producto?.precio || 0) * item.cantidad,
                        };
                    });
                    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
                    return JSON.stringify({ items, total });
                },
            }),

            agregarAlCarrito: tool({
                description: 'Agrega un producto al carrito de compras',
                inputSchema: z.object({
                    productoId: z.number().describe('ID del producto'),
                    cantidad: z.number().describe('Cantidad a agregar'),
                }),
                execute: async ({ productoId, cantidad }) => {
                    const producto = productos.find(p => p.id === productoId);
                    if (!producto) {
                        return JSON.stringify({ success: false, error: 'Producto no encontrado' });
                    }
                    if (producto.stock < cantidad) {
                        return JSON.stringify({ success: false, error: `Stock insuficiente. Solo hay ${producto.stock} unidades` });
                    }

                    carrito.push({ productoId, cantidad });
                    return JSON.stringify({
                        success: true,
                        mensaje: `Se agregaron ${cantidad} x ${producto.nombre} al carrito`,
                        precioUnitario: producto.precio,
                        subtotal: producto.precio * cantidad,
                    });
                },
            }),
        });

    // Flujo de compra simulado
    console.log('👤 Usuario: ¿Tienen laptops disponibles?');
    const resp1 = await agent.run('¿Tienen laptops disponibles?');
    console.log('🤖 IA:', resp1.text);
    console.log('🔧 Tools:', resp1.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    console.log('👤 Usuario: Agrégame 2 laptops al carrito');
    const resp2 = await agent.run('Agrégame 2 laptops al carrito');
    console.log('🤖 IA:', resp2.text);
    console.log('🔧 Tools:', resp2.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    console.log('👤 Usuario: También quiero un mouse y un teclado');
    const resp3 = await agent.run('También quiero un mouse y un teclado, agrega uno de cada uno');
    console.log('🤖 IA:', resp3.text);
    console.log('🔧 Tools:', resp3.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
    console.log();

    console.log('👤 Usuario: ¿Qué tengo en el carrito y cuánto es el total?');
    const resp4 = await agent.run('¿Qué tengo en el carrito y cuánto es el total?');
    console.log('🤖 IA:', resp4.text);
    console.log('🔧 Tools:', resp4.steps.flatMap(s => s.toolCalls.map(t => t.toolName)).join(', ') || 'ninguna');
}

main().catch(console.error);
