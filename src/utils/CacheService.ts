import fs from 'fs-extra';
import path from 'path';
import { homedir } from 'os';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

export class CacheService {
  private static readonly CACHE_DIR = path.join(homedir(), '.jekyll-buildr', 'cache');
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50 MB

  static async initialize() {
    await fs.ensureDir(CacheService.CACHE_DIR);
  }

  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const filePath = path.join(CacheService.CACHE_DIR, `${key}.json`);
      
      if (!await fs.pathExists(filePath)) {
        return null;
      }

      const entry: CacheEntry = await fs.readJson(filePath);
      
      // Check if cache is expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await fs.remove(filePath);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.warn('Cache read error:', (error as Error).message);
      return null;
    }
  }

  static async set(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): Promise<void> { // Default 24 hours
    try {
      // Check current cache size and clean if needed
      await this.maybeCleanup();
      
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      const filePath = path.join(CacheService.CACHE_DIR, `${key}.json`);
      await fs.writeJson(filePath, entry, { spaces: 2 });
    } catch (error) {
      console.warn('Cache write error:', (error as Error).message);
    }
  }

  static async clear(): Promise<void> {
    try {
      if (await fs.pathExists(CacheService.CACHE_DIR)) {
        await fs.emptyDir(CacheService.CACHE_DIR);
      }
    } catch (error) {
      console.warn('Cache clear error:', (error as Error).message);
    }
  }

  static async maybeCleanup(): Promise<void> {
    try {
      if (!await fs.pathExists(CacheService.CACHE_DIR)) {
        return;
      }

      const files = await fs.readdir(CacheService.CACHE_DIR);
      let totalSize = 0;
      
      // Calculate total cache size
      for (const file of files) {
        const filePath = path.join(CacheService.CACHE_DIR, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
      
      // If cache is too large, remove oldest entries
      if (totalSize > CacheService.MAX_CACHE_SIZE) {
        const fileInfo = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(CacheService.CACHE_DIR, file);
            const stats = await fs.stat(filePath);
            return { file, mtime: stats.mtime, size: stats.size };
          })
        );
        
        // Sort by modification time (oldest first)
        fileInfo.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
        
        // Remove oldest files until cache is under size limit
        for (const info of fileInfo) {
          if (totalSize <= CacheService.MAX_CACHE_SIZE * 0.8) { // Keep under 80% of max size
            break;
          }
          
          const filePath = path.join(CacheService.CACHE_DIR, info.file);
          await fs.remove(filePath);
          totalSize -= info.size;
        }
      }
    } catch (error) {
      console.warn('Cache cleanup error:', (error as Error).message);
    }
  }

  static generateKey(url: string, data?: any): string {
    // Create a hash of the URL and any relevant data to form a unique key
    const crypto = require('crypto');
    let key = url;
    if (data) {
      key += JSON.stringify(data);
    }
    return crypto.createHash('md5').update(key).digest('hex');
  }
}