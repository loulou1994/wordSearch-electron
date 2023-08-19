/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

// import { app } from 'electron';
import './assets/styles/index.css';

window.addEventListener('DOMContentLoaded', () => {
  // resize browser window when navigating into app page
  const appLinkEl = document.getElementById('app-window');
  const closeBtn = document.querySelector('.exit-btn')
  
  closeBtn.addEventListener('click', () => {
    const isConfirmed = confirm('Are you sure you want to exit the application?');
    
    if (isConfirmed) close();
  })

  appLinkEl.addEventListener('click', (e) => {
    e.preventDefault();
    window.electronAPI.loadApp_API({ width: 1018, height: 670, page: 'app'});
  });

})
console.log('👋 This message is being logged by "renderer.js", included via webpack');