#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigService } from './services/ConfigService';
import { NotificationService } from './services/NotificationService';
import { UIService } from './services/UIService';
import { CacheService } from './utils/CacheService';
import { MemoryManager } from './utils/MemoryManager';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { ErrorHandler } from './utils/ErrorHandler';

// Initialize cache when the application starts
CacheService.initialize().catch(console.error);

// Initialize memory management
MemoryManager.initialize();

// Initialize performance monitoring
PerformanceMonitor.enable();

// Initialize error handling
ErrorHandler.initialize();

// === MAIN PROGRAM ===
async function createProgram() {
  const program = new Command();
  const packageJson = ConfigService.getPackageInfo() || { version: '0.0.0', name: 'jekyll-buildr' };

  program
    .name(packageJson.name)
    .description('CLI untuk mengelola situs Jekyll dengan kekuatan AI 🚀')
    .version(packageJson.version)
    .hook('preAction', () => {
      UIService.showHeader();
    });

  // Login command - load auth module only when needed
  program
    .command('login')
    .description('Log in to your Jekyll Buildr account')
    .action(async () => {
      const { login } = await import('./auth');
      await login();
    });

  // Logout command - load auth module only when needed
  program
    .command('logout')
    .description('Log out of your Jekyll Buildr account')
    .action(async () => {
      const { logout } = await import('./auth');
      await logout();
    });

  // Create command - load command module only when needed
  program
    .command('create')
    .description('Buat situs Jekyll baru dari prompt AI dan simpan secara lokal.')
    .argument('<siteName>', 'Tentukan nama direktori untuk situs')
    .argument('<prompt>', 'Deskripsi situs yang ingin kamu buat')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(async (siteName, prompt, options) => {
      const { CreateCommand } = await import('./commands/CreateCommand');
      await CreateCommand.execute(siteName, prompt, options);
    });

  // Add commands
  const addCommand = program.command('add')
    .description('Tambahkan konten baru ke proyek Jekyll yang ada dengan AI.');

  // Add post command - load command module only when needed
  addCommand
    .command('post')
    .description('Buat postingan blog baru dari sebuah judul.')
    .argument('<title>', 'Judul untuk postingan blog baru')
    .option('--tags <tags>', 'Tags untuk postingan (dipisahkan koma)')
    .option('--categories <categories>', 'Kategori untuk postingan (dipisahkan koma)')
    .action(async (title, options) => {
      const { AddPostCommand } = await import('./commands/AddPostCommand');
      await AddPostCommand.execute(title, options);
    });

  // Serve command - load command module only when needed
  program
    .command('serve')
    .description('Jalankan server pengembangan Jekyll lokal')
    .option('-p, --port <port>', 'Port yang akan digunakan', '4000')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(async (options) => {
      const { ServeCommand } = await import('./commands/ServeCommand');
      await ServeCommand.execute(options);
    });

  // Build command - load command module only when needed
  program
    .command('build')
    .description('Bangun situs Jekyll')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(async (options) => {
      const { BuildCommand } = await import('./commands/BuildCommand');
      await BuildCommand.execute(options);
    });

  // Doctor command - load command module only when needed
  program
    .command('doctor')
    .description('Periksa environment dan dependencies')
    .action(async () => {
      const { DoctorCommand } = await import('./commands/DoctorCommand');
      await DoctorCommand.execute();
    });

  return program;
}

// === INITIALIZATION ===
async function main() {
  // Check for updates - make this async but don't block
  NotificationService.checkForUpdates().catch(() => {
    // Ignore errors in update check
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    ErrorHandler.handle(error, { operation: 'uncaughtException' });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    ErrorHandler.handle(error, { operation: 'unhandledRejection' });
    process.exit(1);
  });

  // Create and run program
  const program = await createProgram();
  
  // Handle unknown commands
  program.showHelpAfterError('(Gunakan --help untuk melihat perintah yang tersedia)');
  
  // Parse arguments
  program.parse(process.argv);
  
  // Clean up when the process exits
  process.on('exit', () => {
    // Print performance report if in debug mode
    if (process.env.DEBUG_PERFORMANCE) {
      console.log(PerformanceMonitor.report());
    }
    
    MemoryManager.cleanup();
  });
  
  // Handle uncaught exceptions
  process.on('SIGINT', () => {
    // Print performance report if in debug mode
    if (process.env.DEBUG_PERFORMANCE) {
      console.log(PerformanceMonitor.report());
    }
    
    MemoryManager.cleanup();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    // Print performance report if in debug mode
    if (process.env.DEBUG_PERFORMANCE) {
      console.log(PerformanceMonitor.report());
    }
    
    MemoryManager.cleanup();
    process.exit(0);
  });
}

// Run the program
main();