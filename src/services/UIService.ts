import chalk from 'chalk';
import { ErrorHandler } from '../utils/ErrorHandler';

export class UIService {
  static showHeader() {
    console.log(chalk.blue(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║                ${chalk.bold('JEKYLL BUILDR CLI')}                     ║
  ║           ${chalk.yellow('Build Jekyll Sites with AI 🚀')}              ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
    `));
  }

  static handleApiError(error: any) {
    // Use the new error handler for logging
    ErrorHandler.handle(error, { operation: 'API call' });
    
    if (error.response) {
      console.error(chalk.red(`  Error ${error.response.status}: ${error.response.data.error || 'Terjadi kesalahan di server'}`));
      if (error.response.status === 404) {
        console.log(chalk.yellow('  freeUser: Pastikan [Jekyll Buildr API](https://jekyll-buildr.vercel.app) sudah login dengan akun GitHub Anda.'));
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('  Tidak dapat terhubung ke Jekyll Buildr API'));
      console.log(chalk.yellow('  Pastikan API sudah berjalan: npm run dev (di folder API)'));
      console.log(chalk.yellow('  Atau set environment variable: export JEKYLL_BUILDR_API_URL=<your-api-url>'));
    } else {
      console.error(chalk.red(`  Kesalahan tidak terduga: ${error.message}`));
    }
  }
}