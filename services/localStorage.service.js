class LocalStorageService {
  constructor() {
    this.keys = {
      PROJECTS: 'clockify_projects',
      TIME_LOGS: 'clockify_time_logs',
      USER_SETTINGS: 'clockify_user_settings'
    };
  }

  // Projects
  getProjects() {
    try {
      const projects = localStorage.getItem(this.keys.PROJECTS);
      return projects ? JSON.parse(projects) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  saveProjects(projects) {
    try {
      localStorage.setItem(this.keys.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  // Time Logs
  getTimeLogs() {
    try {
      const logs = localStorage.getItem(this.keys.TIME_LOGS);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error loading time logs:', error);
      return [];
    }
  }

  saveTimeLogs(logs) {
    try {
      localStorage.setItem(this.keys.TIME_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving time logs:', error);
    }
  }

  // User Settings
  getUserSettings() {
    try {
      const settings = localStorage.getItem(this.keys.USER_SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error loading user settings:', error);
      return {};
    }
  }

  saveUserSettings(settings) {
    try {
      localStorage.setItem(this.keys.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  // Clear all data
  clearAll() {
    try {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const localStorageService = new LocalStorageService();