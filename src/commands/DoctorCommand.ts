import chalk from 'chalk';
import { execAsync, SystemUtils } from '../utils/SystemUtils';
import { ApiService } from '../services/ApiService';

export class DoctorCommand {
  static async execute() {
    console.log(chalk.blue('🩺 Memeriksa environment...\n'));
    
    const checks = [
      {
        name: 'Node.js',
        check: async () => ({ version: process.version, ok: true })
      },
      {
        name: 'Docker',
        check: async () => {
          const isAvailable = await SystemUtils.checkDocker();
          if (isAvailable) {
            const { stdout } = await execAsync('docker --version');
            return { version: stdout.trim(), ok: true };
          }
          return { version: 'Not installed', ok: false };
        }
      },
      {
        name: 'Jekyll',
        check: async () => {
          const isAvailable = await SystemUtils.checkJekyll();
          if (isAvailable) {
            const { stdout } = await execAsync('jekyll --version');
            return { version: stdout.trim(), ok: true };
          }
          return { version: 'Not installed', ok: false };
        }
      },
      {
        name: 'API Connection',
        check: async () => {
          try {
            await ApiService.checkHealth();
            return { version: 'Connected', ok: true };
          } catch {
            return { version: 'Cannot connect', ok: false };
          }
        }
      }
    ];
    
    for (const check of checks) {
      const result = await check.check();
      const status = result.ok ? chalk.green('✓') : chalk.red('✗');
      console.log(`${status} ${check.name}: ${chalk.cyan(result.version)}`);
    }
    
    await DoctorCommand.showTips();
  }

  static async showTips() {
    console.log(chalk.yellow('\n💡 Tips:'));
    if (!await SystemUtils.checkDocker()) {
      console.log('  - Install Docker: https://docs.docker.com/get-docker/');
    }
    if (!await SystemUtils.checkJekyll()) {
      console.log('  - Install Jekyll: https://jekyllrb.com/docs/installation/');
    }
  }
}
