import chalk from 'chalk';
import { SystemUtils } from '../utils/SystemUtils';

export class BuildCommand {
  static async execute(options: { docker?: boolean; }) {
    const useDocker = options.docker && await SystemUtils.checkDocker();
    
    if (useDocker) {
      await BuildCommand.buildWithDocker();
    } else {
      await BuildCommand.buildWithJekyll();
    }
    
    console.log(chalk.green('📦 Situs siap di-deploy! File ada di folder _site/'));
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
      return;
    }
    
    console.log(chalk.blue('🚀 Membangun situs dengan Jekyll lokal...'));
    const jekyllCommand = 'bundle exec jekyll build';
    await SystemUtils.runCommand(jekyllCommand, 'Situs berhasil dibangun');
  }
}