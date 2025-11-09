import chalk from 'chalk';
import { exec } from 'child_process';
import { SystemUtils } from '../utils/SystemUtils';

export class ServeCommand {
  static async execute(options: { docker?: boolean; port?: string; }) {
    const useDocker = options.docker && await SystemUtils.checkDocker();
    const port = options.port || '4000';

    if (useDocker) {
      await ServeCommand.serveWithDocker(port);
    } else {
      await ServeCommand.serveWithJekyll(port);
    }
  }

  static async serveWithDocker(port: string) {
    console.log(chalk.blue('🐳 Menjalankan server dengan Docker...'));
    const projectPath = process.cwd();
    const dockerCommand = `docker run --rm -it -p ${port}:4000 -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll serve --livereload --force_polling`;

    console.log(chalk.yellow('Tekan Ctrl+C untuk menghentikan server\n'));
    await SystemUtils.runCommand(dockerCommand, 'Server Docker berjalan');
  }

  static async serveWithJekyll(port: string) {
    if (!await SystemUtils.checkJekyll()) {
      console.error(chalk.red('❌ Jekyll tidak ditemukan. Install Jekyll atau gunakan Docker.'));
      console.log(chalk.cyan('Install Jekyll: https://jekyllrb.com/docs/installation/'));
      console.log(chalk.cyan('Atau gunakan: jekyll-buildr serve --no-docker'));
      return;
    }

    console.log(chalk.blue('🚀 Menjalankan server Jekyll lokal...'));
    const jekyllCommand = `bundle exec jekyll serve --livereload --port ${port}`;

    console.log(chalk.yellow('Tekan Ctrl+C untuk menghentikan server\n'));
    const child = exec(jekyllCommand);

    child.stdout?.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr?.on('data', (data) => {
      console.error(chalk.yellow(data.toString()));
    });
  }
}