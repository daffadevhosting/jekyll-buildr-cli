#!/usr/bin/env node
import { Command, Option } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { ensureLoggedIn, login, logout } from './auth';
import updateNotifier from 'update-notifier';
import { JEKYLL_BOILERPLATE_STRUCTURE, JEKYLL_BOILERPLATE_CONTENTS } from './boilerplate';

// --- Helper Functions ---

function saveFile(filePath: string, content: string | Buffer) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created file: ${filePath}`);
}

function isJekyllProject(): boolean {
  return fs.existsSync(path.join(process.cwd(), '_config.yml'));
}

const API_BASE_URL = 'https://jekyll-buildr.vercel.app';

// Recursive function to create boilerplate structure
const createBoilerplate = (structure: any[], baseDir: string) => {
  structure.forEach(item => {
    const itemPath = path.join(baseDir, item.path);
    if (item.type === 'folder') {
      fs.mkdirSync(itemPath, { recursive: true });
      console.log(`✅ Created folder: ${itemPath}`);
      if (item.children) {
        createBoilerplate(item.children, baseDir); // Recursively create children
      }
    } else if (item.type === 'file') {
      const content = JEKYLL_BOILERPLATE_CONTENTS[item.path] || '';
      saveFile(itemPath, content);
    }
  });
};

const execAsync = promisify(exec);
const program = new Command();

// --- CLI Definition ---

const packageJson = require('../package.json');
updateNotifier({ pkg: packageJson }).notify();

program
  .name('jekyll-buildr')
  .description('CLI to build and manage Jekyll sites using AI')
  .version(packageJson.version);

program
  .command('login')
  .description('Log in to your Jekyll Buildr account')
  .action(async () => {
    await login();
  });

program
  .command('logout')
  .description('Log out of your Jekyll Buildr account')
  .action(async () => {
    await logout();
  });

program
  .command('create <projectName> [prompt]')
  .description('Create a new Jekyll site using AI')
  .action(async (projectName: string, prompt: string) => {
    // ... (create command remains the same)
    if (!prompt) {
      console.error('Error: A prompt is required to generate the site.');
      return;
    }
    try {
      const { idToken, displayName } = await ensureLoggedIn();
      console.log(`Authenticated as ${displayName}.\n`);
      const response = await fetch(`${API_BASE_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`API Error: ${(await response.json()).error}`);
      // The AI API is currently returning gemfile and config, but the request is to use boilerplate.
      // So, we will ignore the AI-generated gemfile and config for now.
      // const { gemfile, config } = await response.json(); // Keep this if AI should enhance boilerplate

      const projectDir = path.join(process.cwd(), projectName);
      fs.mkdirSync(projectDir); // Create the root project directory

      // Create the full boilerplate structure
      createBoilerplate(JEKYLL_BOILERPLATE_STRUCTURE, projectDir);

      console.log(`\nSuccess! Your new Jekyll site "${projectName}" was created.`);
    } catch (e: any) { console.error(`\n❌ Error: ${e.message}`); }
  });

program
  .command('generate-post')
  .description('Generate a new post with AI')
  .addOption(new Option('-t, --title <title>', 'Post title').makeOptionMandatory())
  .addOption(new Option('-a, --author <author>', 'Post author'))
  .addOption(new Option('-c, --categories <categories>', 'Post categories (comma-separated)'))
  .action(async (options) => {
    if (!isJekyllProject()) { console.error('Error: Must be run inside a Jekyll project directory.'); return; }
    try {
      const { idToken } = await ensureLoggedIn();
      console.log('🤖 Generating post...');
      const response = await fetch(`${API_BASE_URL}/api/ai/generatePost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify(options),
      });
      if (!response.ok) throw new Error(`API Error: ${(await response.json()).error}`);
      const { filename, content } = await response.json();
      saveFile(path.join(process.cwd(), '_posts', filename), content);
    } catch (e: any) { console.error(`\n❌ Error: ${e.message}`); }
  });

program
  .command('generate-component <prompt>')
  .description('Generate a new component file (_includes) with AI')
  .action(async (prompt: string) => {
    if (!isJekyllProject()) { console.error('Error: Must be run inside a Jekyll project directory.'); return; }
    try {
      const { idToken } = await ensureLoggedIn();
      console.log('🤖 Generating component...');
      const response = await fetch(`${API_BASE_URL}/api/ai/generateComponent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`API Error: ${(await response.json()).error}`);
      const { filename, content } = await response.json();
      saveFile(path.join(process.cwd(), '_includes', filename), content);
    } catch (e: any) { console.error(`\n❌ Error: ${e.message}`); }
  });

program
  .command('generate-image <prompt>')
  .description('Generate an image with AI (Pro feature)')
  .action(async (prompt: string) => {
    if (!isJekyllProject()) { console.error('Error: Must be run inside a Jekyll project directory.'); return; }
    try {
      const { idToken } = await ensureLoggedIn();
      console.log('🎨 Generating image...');
      const response = await fetch(`${API_BASE_URL}/api/ai/generateImage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ prompt }),
      });
      if (response.status === 403) { // Specifically handle "Forbidden" for Pro features
        throw new Error(`API Error: ${(await response.json()).error}. Please upgrade your account.`);
      }
      if (!response.ok) throw new Error(`API Error: ${(await response.json()).error}`);
      const { filename, content } = await response.json();
      const base64Data = content.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      saveFile(path.join(process.cwd(), 'assets', 'images', filename), buffer);
    } catch (e: any) { console.error(`\n❌ Error: ${e.message}`); }
  });

program
  .command('build')
  .description('Build the Jekyll site in the current directory')
  .action(async () => {
    if (!isJekyllProject()) { console.error('Error: Must be run inside a Jekyll project directory.'); return; }
    console.log('Building Jekyll site...');
    try {
      const { stdout, stderr } = await execAsync('jekyll build');
      console.log(stdout);
      if (stderr) { console.error(stderr); }
      console.log('Jekyll site built successfully.');
    } catch (error: any) { console.error('Error building Jekyll site:', error); }
  });

program.parse(process.argv);
