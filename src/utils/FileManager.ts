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

      // Group basic file operations with Promise.all for better performance
      const basicFilesPromises = [
        fs.writeFile(path.join(basePath, 'Gemfile'), FileGenerator.generateGemfile()),
        fs.writeFile(path.join(basePath, '.gitignore'), FileGenerator.generateGitignore()),
        fs.writeFile(path.join(basePath, 'README.md'), FileGenerator.generateReadme(structure))
      ];

      // Write configuration
      if (structure.config) {
        basicFilesPromises.push(
          fs.writeFile(path.join(basePath, '_config.yml'), yaml.stringify(structure.config))
        );
      }

      // Execute basic files in parallel
      await Promise.all(basicFilesPromises);

      // Execute major sections in parallel for better performance
      await Promise.all([
        this.writeLayouts(basePath, structure.layouts),
        this.writeIncludes(basePath, structure.includes),
        this.writePosts(basePath, structure.posts),
        this.writePages(basePath, structure.pages),
        this.writeCollections(basePath, structure.collections),
        this.writeAssets(basePath, structure.assets)
      ]);

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

    // Write all layout files in parallel for better performance
    const layoutPromises = layouts.map(async (layout) => {
      const filename = layout.name.endsWith('.html') ? layout.name : `${layout.name}.html`;
      return fs.writeFile(path.join(layoutsDir, filename), layout.content);
    });
    
    await Promise.all(layoutPromises);
  }

  static async writeIncludes(basePath: string, includes: any[]) {
    if (!includes?.length) return;

    const includesDir = path.join(basePath, '_includes');
    await fs.ensureDir(includesDir);

    // Write all include files in parallel for better performance
    const includePromises = includes.map(async (include) => {
      const filename = include.name.endsWith('.html') ? include.name : `${include.name}.html`;
      return fs.writeFile(path.join(includesDir, filename), include.content);
    });
    
    await Promise.all(includePromises);
  }

  static async writePosts(basePath: string, posts: any[]) {
    if (!posts?.length) return;

    const postsDir = path.join(basePath, '_posts');
    await fs.ensureDir(postsDir);

    // Write all post files in parallel for better performance
    const postPromises = posts.map(async (post) => {
      const slug = post.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      const filename = `${post.date}-${slug}.md`;
      return fs.writeFile(path.join(postsDir, filename), post.content);
    });
    
    await Promise.all(postPromises);
  }

  static async writePages(basePath: string, pages: any[]) {
    if (!pages?.length) return;

    // Write all page files in parallel for better performance
    const pagePromises = pages.map(async (page) => {
      const filename = page.name.match(/\.(html|md)$/) ? page.name : `${page.name}.html`;
      return fs.writeFile(path.join(basePath, filename), page.content);
    });
    
    await Promise.all(pagePromises);
  }

  static async writeAssets(basePath: string, assets: any) {
    if (!assets) return;

    const assetsDir = path.join(basePath, 'assets');
    await fs.ensureDir(assetsDir);

    const assetPromises = [];

    // CSS
    if (assets.css) {
      const cssDir = path.join(assetsDir, 'css');
      await fs.ensureDir(cssDir);
      assetPromises.push(
        fs.writeFile(path.join(cssDir, 'style.css'), assets.css)
      );
    }

    // JavaScript
    if (assets.js) {
      const jsDir = path.join(assetsDir, 'js');
      await fs.ensureDir(jsDir);
      assetPromises.push(
        fs.writeFile(path.join(jsDir, 'script.js'), assets.js || '// JavaScript files will go here')
      );
    }

    // Images directory - create .gitkeep file
    const imagesDir = path.join(assetsDir, 'images');
    await fs.ensureDir(imagesDir);
    assetPromises.push(
      fs.writeFile(path.join(imagesDir, '.gitkeep'), '')
    );

    await Promise.all(assetPromises);
  }

  //[BARU] untuk menangani collections
  static async writeCollections(basePath: string, collections: any) {
    if (!collections || typeof collections !== 'object') return;

    // Process each collection in parallel
    const collectionPromises = [];
    
    for (const [collectionName, items] of Object.entries(collections)) {
      if (!Array.isArray(items) || !items.length) continue;

      collectionPromises.push(
        (async () => {
          const collectionDir = path.join(basePath, `_${collectionName}`);
          await fs.ensureDir(collectionDir);

          // Write all collection items in parallel
          const itemPromises = items.map(async (item) => {
            const filename = item.name.match(/\.(html|md)$/) ? item.name : `${item.name}.md`;
            return fs.writeFile(path.join(collectionDir, filename), item.content);
          });
          
          await Promise.all(itemPromises);
        })()
      );
    }

    await Promise.all(collectionPromises);
  }
}