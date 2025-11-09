import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export interface ErrorContext {
  command?: string;
  operation?: string;
  filePath?: string;
  timestamp: number;
  message: string;
  stack?: string;
}

export class ErrorHandler {
  private static errorLogPath: string;

  static initialize(): void {
    // Create error logs directory in the user's home directory
    const homeDir = require('os').homedir();
    const logsDir = path.join(homeDir, '.jekyll-buildr', 'logs');
    fs.ensureDirSync(logsDir);
    
    ErrorHandler.errorLogPath = path.join(logsDir, 'error-log.json');
  }

  static logError(error: Error | unknown, context?: Partial<ErrorContext>): void {
    try {
      const errorContext: ErrorContext = {
        command: context?.command,
        operation: context?.operation,
        filePath: context?.filePath,
        timestamp: Date.now(),
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      };

      // Write to error log file
      let existingLogs: ErrorContext[] = [];
      if (fs.existsSync(ErrorHandler.errorLogPath)) {
        existingLogs = JSON.parse(fs.readFileSync(ErrorHandler.errorLogPath, 'utf8'));
      }

      // Keep only the last 100 errors to prevent the log from growing indefinitely
      if (existingLogs.length >= 100) {
        existingLogs = existingLogs.slice(-99);
      }

      existingLogs.push(errorContext);
      fs.writeFileSync(ErrorHandler.errorLogPath, JSON.stringify(existingLogs, null, 2));
    } catch (logError) {
      // If we can't log the error, at least don't crash
      console.warn('Failed to log error:', logError);
    }
  }

  static handle(error: Error | unknown, context?: Partial<ErrorContext>): void {
    // Log the error
    ErrorHandler.logError(error, context);

    // Display user-friendly error message
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      
      // Provide specific advice based on error type
      if (error.message.includes('API') || error.message.includes('network')) {
        console.error(chalk.yellow('💡 Possible solution: Check your internet connection and API availability'));
      } else if (error.message.includes('permission') || error.message.includes('EACCES')) {
        console.error(chalk.yellow('💡 Possible solution: Check file permissions or run with appropriate privileges'));
      } else if (error.message.includes('disk') || error.message.includes('ENOSPC')) {
        console.error(chalk.yellow('💡 Possible solution: Check available disk space'));
      } else if (error.message.includes('memory') || error.message.includes('heap')) {
        console.error(chalk.yellow('💡 Possible solution: Close other applications to free memory'));
      }
      
      // Show stack trace only in debug mode
      if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
        console.error(chalk.gray('\nStack trace:'));
        console.error(chalk.gray(error.stack));
      }
    } else {
      console.error(chalk.red('\n❌ An unknown error occurred'));
    }
  }

  static async getRecentErrors(limit: number = 10): Promise<ErrorContext[]> {
    if (!fs.existsSync(ErrorHandler.errorLogPath)) {
      return [];
    }

    try {
      const logs = JSON.parse(await fs.readFile(ErrorHandler.errorLogPath, 'utf8'));
      return logs.slice(-limit).reverse(); // Return last N errors, newest first
    } catch (error) {
      return [];
    }
  }

  static clearErrorLog(): void {
    if (fs.existsSync(ErrorHandler.errorLogPath)) {
      fs.writeFileSync(ErrorHandler.errorLogPath, '[]');
    }
  }

  static async printErrorReport(): Promise<void> {
    const recentErrors = await ErrorHandler.getRecentErrors(5);
    
    if (recentErrors.length === 0) {
      console.log(chalk.green('No recent errors found.'));
      return;
    }

    console.log(chalk.yellow('\n📋 Recent Errors Report:'));
    for (let i = 0; i < recentErrors.length; i++) {
      const error = recentErrors[i];
      console.log(`\n${i + 1}. ${chalk.red(error.message)}`);
      console.log(`   Time: ${new Date(error.timestamp).toISOString()}`);
      if (error.command) console.log(`   Command: ${error.command}`);
      if (error.operation) console.log(`   Operation: ${error.operation}`);
    }
  }
}