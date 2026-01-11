// examples/test-mathjs.ts
import { CommonTools } from '../src/tools/common.js';

async function main() {
    console.log('Testing MathJS Calculator Tool directly...');

    // Test 1: Basic arithmetic
    const res1 = await CommonTools.calculator.execute({ expression: '2 + 3 * 4' });
    console.log('2 + 3 * 4 =', res1);

    // Test 2: Function (sqrt)
    const res2 = await CommonTools.calculator.execute({ expression: 'sqrt(16)' });
    console.log('sqrt(16) =', res2);

    // Test 3: Power
    const res3 = await CommonTools.calculator.execute({ expression: '2^3' });
    console.log('2^3 =', res3);

    // Test 4: Error handling
    const res4 = await CommonTools.calculator.execute({ expression: 'invalid syntax' });
    console.log('Invalid =', res4);
}

main().catch(console.error);
