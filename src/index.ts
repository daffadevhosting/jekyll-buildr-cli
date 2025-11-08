#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigService } from './services/ConfigService';
import { NotificationService } from './services/NotificationService';
import { UIService } from './services/UIService';
import { CreateCommand } from './commands/CreateCommand';
import { AddPostCommand } from './commands/AddPostCommand';
import { ServeCommand } from './commands/ServeCommand';
import { BuildCommand } from './commands/BuildCommand';
import { DoctorCommand } from './commands/DoctorCommand';

// === MAIN PROGRAM ===
function createProgram() {
  const program = new Command();
  const packageJson = ConfigService.getPackageInfo() || { version: '0.0.0', name: 'jekyll-buildr' };

  program
    .name(packageJson.name)
    .description('CLI untuk mengelola situs Jekyll dengan kekuatan AI 🚀')
    .version(packageJson.version)
    .hook('preAction', () => {
      UIService.showHeader();
    });

  // Create command
  program
    .command('create')
    .description('Buat situs Jekyll baru dari prompt AI dan simpan secara lokal.')
    .argument('<prompt>', 'Deskripsi situs yang ingin kamu buat')
    .option('-n, --name <siteName>', 'Tentukan nama direktori untuk situs')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(CreateCommand.execute);

  // Add commands
  const addCommand = program.command('add')
    .description('Tambahkan konten baru ke proyek Jekyll yang ada dengan AI.');

  addCommand
    .command('post')
    .description('Buat postingan blog baru dari sebuah judul.')
    .argument('<title>', 'Judul untuk postingan blog baru')
    .option('--tags <tags>', 'Tags untuk postingan (dipisahkan koma)')
    .option('--categories <categories>', 'Kategori untuk postingan (dipisahkan koma)')
    .action(AddPostCommand.execute);

  // Serve command
  program
    .command('serve')
    .description('Jalankan server pengembangan Jekyll lokal')
    .option('-p, --port <port>', 'Port yang akan digunakan', '4000')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(ServeCommand.execute);

  // Build command
  program
    .command('build')
    .description('Bangun situs Jekyll')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(BuildCommand.execute);

  // Doctor command
  program
    .command('doctor')
    .description('Periksa environment dan dependencies')
    .action(DoctorCommand.execute);

  return program;
}

// === INITIALIZATION ===
async function main() {
  // Check for updates
  await NotificationService.checkForUpdates().catch(() => {
    // Ignore errors in update check
  });

  // Create and run program
  const program = createProgram();
  
  // Handle unknown commands
  program.showHelpAfterError('(Gunakan --help untuk melihat perintah yang tersedia)');
  
  // Parse arguments
  program.parse(process.argv);
}

// Run the program
main();