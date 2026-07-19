const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('backcheck', {
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:selectFolder'),
  scan: (options: { sourcePath: string; backupPath: string }): Promise<any> => ipcRenderer.invoke('scanner:scan', options),
  onScanProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('scan:progress', (_event: any, progress: any) => callback(progress));
  },
  offScanProgress: () => {
    ipcRenderer.removeAllListeners('scan:progress');
  },
  syncBackup: (options: { sourcePath: string; backupPath: string; files: any[] }): Promise<any> => ipcRenderer.invoke('scanner:sync', options),
  onSyncProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('sync:progress', (_event: any, progress: any) => callback(progress));
  },
  offSyncProgress: () => {
    ipcRenderer.removeAllListeners('sync:progress');
  },
  listProjects: (rootPath: string): Promise<any[]> => ipcRenderer.invoke('scanner:listProjects', rootPath),
  getHistory: (limit?: number): Promise<any[]> => ipcRenderer.invoke('history:list', limit),
  getScanById: (id: number): Promise<any> => ipcRenderer.invoke('history:get', id),
  deleteScan: (id: number): Promise<any> => ipcRenderer.invoke('history:delete', id),
  generateHtml: (result: any, locale: string): Promise<any> => ipcRenderer.invoke('report:generateHtml', result, locale),
  generatePdf: (result: any, locale: string): Promise<any> => ipcRenderer.invoke('report:generatePdf', result, locale),
  openPath: (filePath: string): Promise<void> => ipcRenderer.invoke('shell:openPath', filePath),
  showInFolder: (filePath: string): Promise<void> => ipcRenderer.invoke('shell:showItemInFolder', filePath),
  takeScreenshot: (filePath: string): Promise<any> => ipcRenderer.invoke('app:takeScreenshot', filePath),
  navigate: (route: string): Promise<void> => ipcRenderer.invoke('app:navigate', route),
  onNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate', (_event: any, route: string) => callback(route));
  },
});
