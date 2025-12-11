// 重置項目進度

import { ProgressManager } from './utils/progress-manager';
import * as readline from 'readline';

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<void>((resolve) => {
    rl.question('\n⚠️  確定要重置所有進度嗎？ (yes/no): ', (answer) => {
      if (answer.toLowerCase() === 'yes') {
        const progressManager = new ProgressManager();
        progressManager.reset();
        console.log('✅ 進度已重置\n');
      } else {
        console.log('❌ 取消重置\n');
      }
      rl.close();
      resolve();
    });
  });
}

main();
