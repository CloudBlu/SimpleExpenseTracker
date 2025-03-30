const { app, BrowserWindow } = require('electron');
const path = require('path');
const { startServer } = require('./server');

let mainWindow;
let server;

async function createWindow() {
  try {
    // Start the Express server
    const userDataPath = app.getPath('userData');
        console.log('User Data Path:', userDataPath);
        
        server = await startServer(userDataPath);

    // Create the browser window
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false
      }
    });

     // Load the index.html file
     mainWindow.loadFile('public/index.html');

     // Open DevTools in development
     if (process.env.NODE_ENV === 'development') {
         mainWindow.webContents.openDevTools();
     }
    } catch (error) {
      console.error('Failed to start server:', error);
      app.quit();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});