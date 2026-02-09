// examples/run-all.ts
// Script para ejecutar todos los ejemplos en secuencia
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const examples = [
    '01-basic-chat.ts',
    '02-with-memory.ts',
    '03-with-tools.ts',
    '04-custom-tools.ts',
    '05-multi-step-agent.ts',
    '06-different-models.ts',
    '07-openai-basic.ts',
    '08-openai-with-tools.ts',
    '09-bleeding-edge-models.ts',
    '10-streaming.ts',
    '11-media-ocr-whisper.ts',
];

async function runExample(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📂 Ejecutando: ${file}`);
        console.log(`${'='.repeat(60)}\n`);

        const child = spawn('npx', ['tsx', join(__dirname, file)], {
            stdio: 'inherit',
            shell: true,
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${file} falló con código ${code}`));
            }
        });
    });
}

async function main() {
    console.log('🚀 Ejecutando todos los ejemplos de mi-agente-lib\n');

    for (const example of examples) {
        try {
            await runExample(example);
            // Pequeña pausa entre ejemplos para no saturar la API
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error(`❌ Error en ${example}:`, err);
        }
    }

    console.log('\n✅ Todos los ejemplos ejecutados');
}

main().catch(console.error);
