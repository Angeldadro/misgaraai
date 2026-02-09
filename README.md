# 🤖 @misgara/ai-agent

Una librería ligera, flexible y agnóstica para construir Agentes de IA en Node.js/TypeScript. Diseñada con arquitectura hexagonal, soporta múltiples proveedores (OpenAI, Google Gemini), gestión de memoria persistente (Redis) y ejecución de herramientas (Function Calling).

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)

## ✨ Características

- **Fluent Interface**: API intuitiva con `AgentBuilder` para configurar agentes rápidamente.
- **Multi-Modelo**: Soporte nativo para Google Gemini y OpenAI (fácilmente extensible).
- **Memoria Persistente**:
  - `InMemoryAdapter` para desarrollo.
  - `RedisMemory` para producción (escalable).
- **Herramientas (Tools)**: Sistema robusto de *Function Calling* utilizando esquemas Zod.
- **Modos de Ejecución**:
  - `run`: Chat con estado (memoria).
  - `runStateless`: Ejecución única sin memoria.
  - `stream`: Respuestas en tiempo real.
- **Multi-paso (Agentic)**: Capacidad de resolver problemas complejos ejecutando múltiples herramientas en bucle.

## 📦 Instalación

```bash
npm install @misgara/ai-agent
# o
yarn add @misgara/ai-agent
```

Asegúrate de configurar tus variables de entorno en un archivo `.env`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_aqui
OPENAI_API_KEY=tu_clave_aqui
DEEPINFRA_API_KEY=tu_clave_aqui
REDIS_URL=redis://localhost:6379
```

## 🚀 Uso Rápido

### 1. Chat Básico

```typescript
import { AgentBuilder } from '@misgara/ai-agent';

const agent = new AgentBuilder()
    .useOpenAI('gpt-4o-mini') 
    .setSystem('Eres un asistente experto en programación.');

const response = await agent.runStateless('¿Qué es una promesa en JS?');
console.log(response.text);
```

### 2. Chat con Memoria y Herramientas

```typescript
import { AgentBuilder, InMemoryAdapter, CommonTools } from '@misgara/ai-agent';

const memory = new InMemoryAdapter();

const agent = new AgentBuilder()
    .useGemini('gemini-1.5-flash')
    .withMemory(memory, 'session-user-123')
    .addTools({
        hora: CommonTools.time,
        calcular: CommonTools.calculator
    });

const res = await agent.run('¿Qué hora es y cuánto es 25 * 40?');
console.log(res.text);

```


### 3. OCR (DeepSeek) + Audio a Texto (Whisper)

```typescript
import { MediaBuilder } from '@misgara/ai-agent';

const media = new MediaBuilder()
    .useDeepSeekOCR('deepseek-ai/DeepSeek-OCR')
    .useOpenAIWhisper('whisper-1');

const ocr = await media.extractTextFromImage(
    'https://example.com/factura.png'
);
console.log(ocr.text);

const audio = await media.transcribeAudio(
    'https://example.com/audio.wav'
);
console.log(audio.text);
```

## 🛠 Creación de Tools Personalizadas

Puedes conectar el agente a tu lógica de negocio (bases de datos, APIs externas) fácilmente:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const myTool = tool({
    description: 'Busca el estado de un pedido',
    inputSchema: z.object({
        orderId: z.string().describe('ID del pedido (ej: ORD-001)')
    }),
    execute: async ({ orderId }) => {
        return JSON.stringify({ status: 'En camino', eta: '2 horas' });
    }
});

agent.addTools({ buscarPedido: myTool });
```

## 📚 Ejemplos

El repositorio incluye una carpeta `examples/` con casos de uso detallados:

- `01-basic-chat.ts`: Chat simple.
- `02-with-memory.ts`: Persistencia de contexto.
- `03-with-tools.ts`: Uso de herramientas predefinidas.
- `04-custom-tools.ts`: E-commerce simulado.
- `05-multi-step-agent.ts`: Resolución de problemas complejos.
- `10-streaming.ts`: Respuestas en tiempo real.
- `11-media-ocr-whisper.ts`: OCR con DeepSeek y transcripcion con Whisper.

Para correr los ejemplos:

```bash
npx tsx examples/run-all.ts
```

Demo directo de OCR + Whisper:

```bash
npm run demo:media
```

Nota: el demo acepta URLs remotas para imagen/audio y la libreria ahora las normaliza internamente.

Opcionalmente puedes pasar tus propias URLs:

```bash
npm run demo:media -- "https://tu-sitio.com/imagen.png" "https://tu-sitio.com/audio.wav"
```

## 🏗 Arquitectura

El proyecto sigue principios de **Arquitectura Hexagonal**:

- **Core**: Logica del agente (`AgentBuilder`) y tareas de media (`MediaBuilder`).
- **Puertos**: Interfaces como `IMemoryAdapter`.
- **Adaptadores**: Implementaciones concretas (`RedisMemory`, `GeminiProvider`).

Esto permite cambiar la base de datos o el proveedor de IA sin tocar la lógica de negocio.

## Produccion y Publicacion

Antes de publicar en npm:

```bash
npm run release:verify
```

Este comando ejecuta:

- `clean`
- `typecheck`
- `build`
- `npm pack --dry-run` (verifica el contenido real del paquete)
