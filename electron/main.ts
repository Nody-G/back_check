import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { scanProject, listProjectFolders, syncBackup } from './scanner';
import { initDatabase, saveScanResult, getScanHistory, getScanById, deleteScan, closeDatabase } from './database';
import { generateHtmlReport, generatePdfReport } from './report';
import { ScanOptions, SyncOptions, Locale } from './types';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged && !process.argv.includes('--screenshots');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Backcheck',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the built renderer — works in both dev and packaged mode
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
  
  // Auto-capture screenshots if --screenshots flag is passed
  if (process.argv.includes('--screenshots')) {
    setTimeout(async () => {
      const screenshotDir = path.join(__dirname, '..', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const takeScreenshot = async (filePath: string) => {
        if (!mainWindow) return;
        const image = await mainWindow.capturePage();
        fs.writeFileSync(filePath, image.toPNG());
        console.log(`Screenshot: ${filePath}`);
      };
      
      const navigateTo = async (route: string) => {
        if (!mainWindow) return;
        mainWindow.webContents.send('navigate', route);
        await new Promise(resolve => setTimeout(resolve, 1000));
      };
      
      // Capture each page
      await takeScreenshot(path.join(screenshotDir, '01-scan-page.png'));
      await navigateTo('history');
      await takeScreenshot(path.join(screenshotDir, '02-history-page.png'));
      await navigateTo('settings');
      await takeScreenshot(path.join(screenshotDir, '03-settings-page.png'));
      await navigateTo('help');
      await takeScreenshot(path.join(screenshotDir, '04-help-page.png'));
      
      console.log('All screenshots captured!');
      app.quit();
    }, 3000); // Wait for app to fully load
  }
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// ── IPC Handlers ──

ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('scanner:scan', async (_event, options: ScanOptions) => {
  try {
    const result = await scanProject(options, (progress) => {
      if (mainWindow) {
        mainWindow.webContents.send('scan:progress', progress);
      }
    });
    const id = saveScanResult(result);
    return { ...result, id };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('scanner:listProjects', async (_event, rootPath: string) => {
  try {
    return listProjectFolders(rootPath);
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('history:list', async (_event, limit?: number) => {
  try {
    return getScanHistory(limit);
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('history:get', async (_event, id: number) => {
  try {
    return getScanById(id);
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('history:delete', async (_event, id: number) => {
  try {
    deleteScan(id);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('scanner:sync', async (_event, options: SyncOptions) => {
  try {
    const result = await syncBackup(options, (progress) => {
      if (mainWindow) {
        mainWindow.webContents.send('sync:progress', progress);
      }
    });
    return result;
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('report:generateHtml', async (_event, result: any, locale: Locale) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow!, {
      title: 'Save HTML Report',
      defaultPath: `backcheck-report-${new Date().toISOString().slice(0, 10)}.html`,
      filters: [{ name: 'HTML', extensions: ['html'] }],
    });
    if (!filePath) return { canceled: true };
    const html = generateHtmlReport(result, locale);
    fs.writeFileSync(filePath, html, 'utf-8');
    return { success: true, path: filePath };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('report:generatePdf', async (_event, result: any, locale: Locale) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow!, {
      title: 'Save PDF Report',
      defaultPath: `backcheck-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (!filePath) return { canceled: true };

    // Generate HTML first, then use BrowserWindow to print to PDF
    const html = generateHtmlReport(result, locale);
    const tempHtml = filePath.replace(/\.pdf$/, '.temp.html');
    fs.writeFileSync(tempHtml, html, 'utf-8');

    const pdfWindow = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true } });
    await pdfWindow.loadFile(tempHtml);
    const pdfData = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 10, bottom: 10, left: 10, right: 10 },
    });
    fs.writeFileSync(filePath, pdfData);
    pdfWindow.close();

    // Cleanup temp file
    try { fs.unlinkSync(tempHtml); } catch {}

    return { success: true, path: filePath };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('shell:openPath', async (_event, filePath: string) => {
  shell.openPath(filePath);
});

ipcMain.handle('shell:showItemInFolder', async (_event, filePath: string) => {
  shell.showItemInFolder(filePath);
});

// ── Screenshot handler (for README captures) ──
ipcMain.handle('app:takeScreenshot', async (_event, filePath: string) => {
  if (!mainWindow) return { error: 'No window' };
  try {
    const image = await mainWindow.capturePage();
    const pngData = image.toPNG();
    fs.writeFileSync(filePath, pngData);
    return { success: true, path: filePath };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('app:navigate', async (_event, route: string) => {
  if (!mainWindow) return;
  mainWindow.webContents.send('navigate', route);
});
