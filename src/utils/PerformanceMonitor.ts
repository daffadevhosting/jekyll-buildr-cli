export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter: NodeJS.MemoryUsage;
  error?: Error;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static enabled = true;

  static enable(): void {
    PerformanceMonitor.enabled = true;
  }

  static disable(): void {
    PerformanceMonitor.enabled = false;
  }

  static async measure<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    if (!PerformanceMonitor.enabled) {
      return fn();
    }

    const startTime = Date.now();
    const memoryBefore = process.memoryUsage();

    try {
      const result = await fn();
      
      const endTime = Date.now();
      const memoryAfter = process.memoryUsage();
      
      const metric: PerformanceMetric = {
        operation,
        startTime,
        endTime,
        duration: endTime - startTime,
        memoryBefore,
        memoryAfter
      };
      
      PerformanceMonitor.metrics.push(metric);
      PerformanceMonitor.logMetric(metric);
      
      return result;
    } catch (error) {
      const endTime = Date.now();
      const memoryAfter = process.memoryUsage();
      
      const metric: PerformanceMetric = {
        operation,
        startTime,
        endTime,
        duration: endTime - startTime,
        memoryBefore,
        memoryAfter,
        error: error as Error
      };
      
      PerformanceMonitor.metrics.push(metric);
      PerformanceMonitor.logMetric(metric);
      
      throw error;
    }
  }

  static logMetric(metric: PerformanceMetric): void {
    if (process.env.DEBUG_PERFORMANCE || process.env.NODE_ENV === 'development') {
      console.log(
        `[PERFORMANCE] ${metric.operation}: ${metric.duration}ms | ` +
        `Memory: ${(metric.memoryAfter.heapUsed / 1024 / 1024).toFixed(2)}MB -> ${(metric.memoryBefore.heapUsed / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  static getMetrics(): PerformanceMetric[] {
    return [...PerformanceMonitor.metrics];
  }

  static getAverageDuration(operation: string): number {
    const ops = PerformanceMonitor.metrics.filter(m => m.operation === operation);
    if (ops.length === 0) return 0;
    
    const total = ops.reduce((sum, metric) => sum + metric.duration, 0);
    return total / ops.length;
  }

  static reset(): void {
    PerformanceMonitor.metrics = [];
  }

  static report(): string {
    if (PerformanceMonitor.metrics.length === 0) {
      return 'No performance metrics collected.';
    }

    const operations = [...new Set(PerformanceMonitor.metrics.map(m => m.operation))];
    let report = '=== Performance Report ===\n';
    
    for (const op of operations) {
      const ops = PerformanceMonitor.metrics.filter(m => m.operation === op);
      const totalDuration = ops.reduce((sum, m) => sum + m.duration, 0);
      const avgDuration = totalDuration / ops.length;
      const errors = ops.filter(m => m.error).length;
      
      report += `${op}: ${ops.length} calls, `;
      report += `total: ${totalDuration}ms, `;
      report += `avg: ${avgDuration.toFixed(2)}ms, `;
      report += `errors: ${errors}\n`;
    }
    
    return report;
  }
}