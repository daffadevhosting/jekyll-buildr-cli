import path from 'path';
import fs from 'fs-extra';

// === CONFIGURATION ===
const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');

export class ConfigService {
  static API_BASE_URL = process.env.JEKYLL_STUDIO_API_URL || 'https://jekyll-buildr.vercel.app/api';
  
  static getPackageInfo() {
    try {
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      return null;
    }
  }
}