import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ApiService } from '../services/ApiService';
import { UIService } from '../services/UIService';
import { ensureLoggedIn } from '../auth'; // Import ensureLoggedIn

export class AddPostCommand {
  static async execute(title: string, options: { tags?: string; categories?: string; }) {
    const spinner = ora('✍️  AI sedang menulis postingan untukmu...').start();
    
    try {
      const { idToken } = await ensureLoggedIn(); // Get idToken
      const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
      const categories = options.categories ? options.categories.split(',').map(c => c.trim()) : [];
      
      const { content } = await ApiService.createPost(title, idToken, tags, categories); // Pass idToken
      
      const date = new Date().toISOString().split('T')[0];
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      const filename = `${date}-${slug}.md`;

      const postsPath = path.join(process.cwd(), '_posts');
      await fs.ensureDir(postsPath);
      await fs.writeFile(path.join(postsPath, filename), content);

      spinner.succeed(chalk.green('✅ Postingan baru berhasil ditambahkan!'));
      console.log(`  ${chalk.bold('📄 File:')} ${chalk.cyan(path.join('_posts', filename))}`);

    } catch (error) {
      spinner.fail(chalk.red('❌ Gagal menambahkan postingan.'));
      UIService.handleApiError(error);
    }
  }
}