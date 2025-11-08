import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { ApiService } from '../services/ApiService';
import { FileManager } from '../utils/FileManager';
import { UIService } from '../services/UIService';

export class CreateCommand {
  static async execute(prompt: string, options: { name?: string; noDocker?: boolean; }) {
    let spinner = ora('🧠 Menghubungi AI untuk merancang situsmu...').start();
    
    try {
      const { structure } = await ApiService.createSite(prompt, options);
      const siteName = options.name || structure.name || 'jekyll-site';
      const sitePath = path.join(process.cwd(), siteName);

      if (await fs.pathExists(sitePath)) {
        spinner.stop(); // Stop spinner sebelum prompt user
        
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
        await fs.remove(sitePath);
        spinner.succeed('Direktori lama dihapus.');
      }

      // Start spinner untuk pembuatan file
      spinner = ora('📁 Membuat struktur file...').start();
      await FileManager.writeStructureToDisk(sitePath, structure);
      
      spinner.succeed(chalk.green('✅ Proyek berhasil dibuat!'));
      
      CreateCommand.showSuccessMessage(siteName, structure);

    } catch (error) {
      if (spinner.isSpinning) {
        spinner.fail(chalk.red('❌ Gagal membuat situs.'));
      }
      UIService.handleApiError(error);
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