import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';
import ora from 'ora';
import { FileGenerator } from './FileGenerator';

export class FileManager {
  static async writeStructureToDisk(basePath: string, structure: any) {
    const spinner = ora('Membuat struktur file...').start();
    
    try {
      await fs.ensureDir(basePath);

      // Generate basic files
      await Promise.all([
        fs.writeFile(path.join(basePath, 'Gemfile'), FileGenerator.generateGemfile()),
        fs.writeFile(path.join(basePath, '.gitignore'), FileGenerator.generateGitignore()),
        fs.writeFile(path.join(basePath, 'README.md'), FileGenerator.generateReadme(structure))
      ]);

      // Write configuration
      if (structure.config) {
        await fs.writeFile(path.join(basePath, '_config.yml'), yaml.stringify(structure.config));
      }

      // Write layouts
      await this.writeLayouts(basePath, structure.layouts);

      // Write includes
      await this.writeIncludes(basePath, structure.includes);

      // Write posts
      await this.writePosts(basePath, structure.posts);

      // Write pages
      await this.writePages(basePath, structure.pages);

      // Write collections (e.g., products)
      await this.writeCollections(basePath, structure.collections);

      // Write assets
      await this.writeAssets(basePath, structure.assets);

      spinner.succeed('Struktur file berhasil dibuat!');
    } catch (error) {
      spinner.fail('Gagal membuat struktur file');
      throw error;
    }
  }

  static async writeLayouts(basePath: string, layouts: any[]) {
    if (!layouts?.length) return;

    const layoutsDir = path.join(basePath, '_layouts');
    await fs.ensureDir(layoutsDir);
    
    for (const layout of layouts) {
      const filename = layout.name.endsWith('.html') ? layout.name : `${layout.name}.html`;
      await fs.writeFile(path.join(layoutsDir, filename), layout.content);
    }
  }

  static async writeIncludes(basePath: string, includes: any[]) {
    if (!includes?.length) return;

    const includesDir = path.join(basePath, '_includes');
    await fs.ensureDir(includesDir);
    
    for (const include of includes) {
      const filename = include.name.endsWith('.html') ? include.name : `${include.name}.html`;
      await fs.writeFile(path.join(includesDir, filename), include.content);
    }
  }

  static async writePosts(basePath: string, posts: any[]) {
    if (!posts?.length) return;

    const postsDir = path.join(basePath, '_posts');
    await fs.ensureDir(postsDir);
    
    for (const post of posts) {
      const slug = post.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      const filename = `${post.date}-${slug}.md`;
      await fs.writeFile(path.join(postsDir, filename), post.content);
    }
  }

  static async writePages(basePath: string, pages: any[]) {
    if (!pages?.length) return;

    for (const page of pages) {
      const filename = page.name.match(/\.(html|md)$/) ? page.name : `${page.name}.html`;
      await fs.writeFile(path.join(basePath, filename), page.content);
    }
  }

  static async writeAssets(basePath: string, assets: any) {
    if (!assets) return;

    const assetsDir = path.join(basePath, 'assets');
    await fs.ensureDir(assetsDir);

    // CSS
    if (assets.css) {
      const cssDir = path.join(assetsDir, 'css');
      await fs.ensureDir(cssDir);
      await fs.writeFile(path.join(cssDir, 'style.css'), assets.css);
    }

    // JavaScript
    if (assets.js) {
      const jsDir = path.join(assetsDir, 'js');
      await fs.ensureDir(jsDir);
      await fs.writeFile(path.join(jsDir, 'script.js'), assets.js || '// JavaScript files will go here');
    }

    // Images directory
    const imagesDir = path.join(assetsDir, 'images');
    await fs.ensureDir(imagesDir);
    await fs.writeFile(path.join(imagesDir, '.gitkeep'), '');
  }

  //[BARU] untuk menangani collections
  static async writeCollections(basePath: string, collections: any) {
    if (!collections || typeof collections !== 'object') return;

    for (const [collectionName, items] of Object.entries(collections)) {
      if (!Array.isArray(items) || !items.length) continue;

      const collectionDir = path.join(basePath, `_${collectionName}`);
      await fs.ensureDir(collectionDir);

      for (const item of items) {
        const filename = item.name.match(/\.(html|md)$/) ? item.name : `${item.name}.md`;
        await fs.writeFile(path.join(collectionDir, filename), item.content);
      }
    }
  }
}