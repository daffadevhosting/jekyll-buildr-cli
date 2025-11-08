import chalk from 'chalk';

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
    if (error.response) {
      console.error(chalk.red(`  Error ${error.response.status}: ${error.response.data.error || 'Terjadi kesalahan di server'}`));
      if (error.response.status === 404) {
        console.log(chalk.yellow('  freeUser: Pastikan [Jekyll Studio API](https://github.com/daffadevhosting/jekyll-studio-api) sudah berjalan di http://localhost:3000'));
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('  Tidak dapat terhubung ke Jekyll Studio API'));
      console.log(chalk.yellow('  Pastikan API sudah berjalan: npm run dev (di folder API)'));
      console.log(chalk.yellow('  Atau set environment variable: export JEKYLL_STUDIO_API_URL=<your-api-url>'));
    } else {
      console.error(chalk.red(`  Kesalahan tidak terduga: ${error.message}`));
    }
  }
}