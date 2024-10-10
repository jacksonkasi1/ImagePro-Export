// cron/cron-tasks.js
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const LOGS_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOGS_DIR, 'cleanup.log');

// Ensure the logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

// Task to delete files older than 60 minutes every hour
cron.schedule('0 * * * *', () => {
  console.log('Running cleanup task for old files.');

  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(UPLOADS_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        const now = Date.now();
        const mtime = new Date(stats.mtime).getTime();
        const diffMinutes = (now - mtime) / (1000 * 60);

        if (diffMinutes > 60) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log(`Deleted file: ${file}`);
              fs.appendFileSync(LOG_FILE, `Deleted file: ${filePath} at ${new Date().toISOString()}\n`);
            }
          });
        }
      });
    });
  });
});

// Task to reset the log file every week
cron.schedule('0 0 * * 0', () => {
  console.log('Running task to reset the cleanup log.');

  fs.writeFile(LOG_FILE, `Log file reset at ${new Date().toISOString()}\n`, err => {
    if (err) {
      console.error('Error resetting log file:', err);
    } else {
      console.log('Log file has been reset.');
    }
  });
});


// Task to make an API call every 2 hours
cron.schedule('0 */2 * * *', () => {
  console.log('Running API call task every 2 hours.');

  axios.get('https://jacksonkasi-imagepro-file-process.hf.space/')
    .then(response => {
      console.log('API call successful:', response.data);
      fs.appendFileSync(LOG_FILE, `✅ API call successful at ${new Date().toISOString()} with response: ${response.data}\n`);
    })
    .catch(error => {
      console.error('Error during API call:', error);
      fs.appendFileSync(LOG_FILE, `🏥 API call failed at ${new Date().toISOString()} with error: ${error.message}\n`);
    });
});