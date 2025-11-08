import { promisify } from 'util';
import { exec } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';

export const execAsync = promisify(exec);

export class SystemUtils {
  static async checkCommand(command: string) {
    try {
      await execAsync(`${command} --version`);
      return true;
    } catch {
      return false;
    }
  }

  static async checkDocker() {
    return this.checkCommand('docker');
  }

  static async checkJekyll() {
    return this.checkCommand('jekyll');
  }

  static async runCommand(command: string, successMessage = 'Command finished.', cwd = process.cwd()) {
    const spinner = ora(`Running: ${command.split(' ')[0]}...`).start();
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      spinner.succeed(successMessage);
      if (stdout) console.log(chalk.gray(stdout));
      if (stderr) console.error(chalk.yellow(stderr));
      return true;
    } catch (error: any) {
      spinner.fail('Command failed.');
      console.error(chalk.red(error.stderr || error.message));
      return false;
    }
  }
}