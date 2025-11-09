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
            try {
              const { stdout } = await execAsync('docker --version');
              return { version: stdout.trim(), ok: true };
            } catch {
              return { version: 'Not working properly', ok: false };
            }
          }
          return { version: 'Not installed', ok: false };
        }
      },
      {
        name: 'Jekyll',
        check: async () => {
          const isAvailable = await SystemUtils.checkJekyll();
          if (isAvailable) {
            try {
              const { stdout } = await execAsync('jekyll --version');
              return { version: stdout.trim(), ok: true };
            } catch {
              return { version: 'Not working properly', ok: false };
            }
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
          } catch (error) {
            return { version: 'Cannot connect', ok: false };
          }
        }
      }
    ];

    const results = [];
    for (const check of checks) {
      try {
        const result = await check.check();
        results.push({ ...result, name: check.name });
        const status = result.ok ? chalk.green('✓') : chalk.red('✗');
        console.log(`${status} ${check.name}: ${chalk.cyan(result.version)}`);
      } catch (error) {
        const result = { version: 'Check failed', ok: false, name: check.name };
        results.push(result);
        console.log(`${chalk.red('✗')} ${check.name}: ${chalk.cyan(result.version)}`);
      }
    }

    await DoctorCommand.showTips(results);
  }

  static async showTips(results: Array<{ name: string; ok: boolean; version: string }>) {
    console.log(chalk.yellow('\n💡 Tips:'));
    const dockerCheck = results.find(r => r.name === 'Docker');
    if (!dockerCheck?.ok) {
      console.log('  - Install Docker: https://docs.docker.com/get-docker/');
    }
    const jekyllCheck = results.find(r => r.name === 'Jekyll');
    if (!jekyllCheck?.ok) {
      console.log('  - Install Jekyll: https://jekyllrb.com/docs/installation/');
    }
    
    const apiCheck = results.find(r => r.name === 'API Connection');
    if (!apiCheck?.ok) {
      console.log('  - Check your internet connection and API availability');
    }
  }
}