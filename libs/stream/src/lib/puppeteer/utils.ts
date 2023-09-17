// todo puppeteer might implement this
// might not need to do ourselves
// copied from https://github.com/SamuelScheit/puppeteer-stream/blob/main/tests/_utils.js
const child_process = require('child_process');

export const getExecutablePath = () => {
  if ('CHROME_BIN' in process.env) {
    return process.env['CHROME_BIN'];
  }

  let executablePath;
  if (process.platform === 'linux') {
    try {
      executablePath = child_process
        .execSync('which chromium-browser')
        .toString()
        .split('\n')
        .shift();
    } catch (e) {
      // NOOP
    }

    if (!executablePath) {
      executablePath = child_process
        .execSync('which chromium')
        .toString()
        .split('\n')
        .shift();
      if (!executablePath) {
        throw new Error('Chromium not found (which chromium)');
      }
    }
  } else if (process.platform === 'darwin') {
    executablePath =
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  } else if (process.platform === 'win32') {
    executablePath =
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  } else {
    throw new Error('Unsupported platform: ' + process.platform);
  }

  return executablePath;
};
