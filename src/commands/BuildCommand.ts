import chalk from 'chalk';
import { SystemUtils } from '../utils/SystemUtils';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export class BuildCommand {
  static async execute(options: { docker?: boolean; }) {
    try {
      const useDocker = options.docker && await SystemUtils.checkDocker();

      if (useDocker) {
        await PerformanceMonitor.measure(
          'buildWithDocker',
          () => BuildCommand.buildWithDocker()
        );
      } else {
        await PerformanceMonitor.measure(
          'buildWithJekyll', 
          () => BuildCommand.buildWithJekyll()
        );
      }

      console.log(chalk.green('📦 Situs siap di-deploy! File ada di folder _site/'));
    } catch (error) {
      console.error(chalk.red('❌ Gagal membangun situs:'), error.message);
      process.exit(1);
    }
  }

  static async buildWithDocker() {
    console.log(chalk.blue('🐳 Membangun situs dengan Docker...'));
    const projectPath = process.cwd();
    const dockerCommand = `docker run --rm -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll build`;
    await SystemUtils.runCommand(dockerCommand, 'Situs berhasil dibangun dengan Docker');
  }

  static async buildWithJekyll() {
    if (!await SystemUtils.checkJekyll()) {
      console.error(chalk.red('❌ Jekyll tidak ditemukan. Install Jekyll atau gunakan Docker.'));
      process.exit(1);
    }

    console.log(chalk.blue('🚀 Membangun situs dengan Jekyll lokal...'));
    const jekyllCommand = 'bundle exec jekyll build';
    await SystemUtils.runCommand(jekyllCommand, 'Situs berhasil dibangun');
  }
}