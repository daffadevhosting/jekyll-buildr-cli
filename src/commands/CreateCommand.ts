import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { ApiService } from '../services/ApiService';
import { FileManager } from '../utils/FileManager';
import { UIService } from '../services/UIService';
import { ensureLoggedIn } from '../auth'; // Import ensureLoggedIn
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export class CreateCommand {
  static async execute(siteName: string, prompt: string, options: { noDocker?: boolean; }) {
    let spinner: ora.Ora | null = null;

    try {
      spinner = ora('🧠 Menghubungi AI untuk merancang situsmu...').start();

      // Use performance monitoring for API call
      const { idToken } = await ensureLoggedIn(); // Get idToken
      const { structure } = await PerformanceMonitor.measure(
        'createSite API call',
        () => ApiService.createSite(prompt, idToken, options)
      ); // Pass idToken
      const projectPath = path.join(process.cwd(), siteName);

      if (await fs.pathExists(projectPath)) {
        if (spinner?.isSpinning) spinner.stop(); // Stop spinner sebelum prompt user

        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Direktori "${siteName}" sudah ada. Timpa?`,
            default: false
          }
        ]);

        if (!overwrite) {
          console.log(chalk.yellow('❌ Dibatalkan oleh pengguna.'));
          return;
        }

        // Start new spinner untuk penghapusan
        spinner = ora('🗑️  Menghapus direktori lama...').start();
        await fs.remove(projectPath);
        spinner.succeed('Direktori lama dihapus.');
      }

      // Start spinner untuk pembuatan file
      spinner = ora('📁 Membuat struktur file...').start();
      
      // Use performance monitoring for file operations
      await PerformanceMonitor.measure(
        'writeStructureToDisk',
        () => FileManager.writeStructureToDisk(projectPath, structure)
      );

      spinner.succeed(chalk.green('✅ Proyek berhasil dibuat!'));

      CreateCommand.showSuccessMessage(siteName, structure);

    } catch (error) {
      if (spinner?.isSpinning) {
        spinner.fail(chalk.red('❌ Gagal membuat situs.'));
      }
      UIService.handleApiError(error);
    } finally {
      // Ensure spinner stops in case of any error
      if (spinner?.isSpinning) {
        spinner.stop();
      }
    }
  }

  static showSuccessMessage(siteName: string, structure: { title?: string; description?: string; }) {
    console.log(`
  ${chalk.bold('📁 Lokasi:')} ${chalk.cyan(path.join(process.cwd(), siteName))}
  ${chalk.bold('🏷️  Nama:')} ${chalk.cyan(structure.title ?? '')}
  ${chalk.bold('📝 Deskripsi:')} ${chalk.cyan(structure.description ?? '')}

  ${chalk.bold('Untuk memulai:')}
  ${chalk.cyan(`cd ${siteName}`)}
  ${chalk.cyan('bundle install')}
  ${chalk.cyan('bundle exec jekyll serve --livereload')}

  ${chalk.bold('Atau gunakan Docker:')}
  ${chalk.cyan('jekyll-buildr serve')}
    `);
  }
}