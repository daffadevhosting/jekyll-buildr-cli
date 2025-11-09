export class MemoryManager {
  private static readonly MEMORY_THRESHOLD = 500 * 1024 * 1024; // 500 MB threshold
  private static gcInterval: NodeJS.Timeout | null = null;

  static initialize(): void {
    // Enable automatic garbage collection if available
    if (global.gc) {
      // Run garbage collection periodically
      MemoryManager.gcInterval = setInterval(() => {
        MemoryManager.performGarbageCollection();
      }, 30000); // Every 30 seconds
    }

    // Also run garbage collection when memory usage is high
    setInterval(() => {
      const usage = process.memoryUsage();
      if (usage.heapUsed > MemoryManager.MEMORY_THRESHOLD) {
        MemoryManager.performGarbageCollection();
      }
    }, 10000); // Check every 10 seconds
  }

  static performGarbageCollection(): void {
    if (global.gc) {
      global.gc();
    }
  }

  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  static getFormattedMemoryUsage(): string {
    const usage = MemoryManager.getMemoryUsage();
    return `Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB, Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`;
  }

  static cleanup(): void {
    if (MemoryManager.gcInterval) {
      clearInterval(MemoryManager.gcInterval);
      MemoryManager.gcInterval = null;
    }
  }

  static logMemoryUsage(tag: string = ''): void {
    const usage = MemoryManager.getFormattedMemoryUsage();
    console.log(`[Memory Usage ${tag}] ${usage}`);
  }
}