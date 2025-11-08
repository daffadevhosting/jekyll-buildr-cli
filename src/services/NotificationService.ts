import updateNotifier from 'update-notifier';
import { ConfigService } from './ConfigService';

export class NotificationService {
  static async checkForUpdates() {
    try {
      const packageJson = ConfigService.getPackageInfo();
      if (!packageJson) return;

      const notifier = updateNotifier({
        pkg: packageJson,
        updateCheckInterval: 1000 * 60 * 60 * 24 // 1 day
      });

      notifier.notify({ isGlobal: true });
    } catch (error) {
      // Silent fail - don't disturb user with update check errors
    }
  }
}