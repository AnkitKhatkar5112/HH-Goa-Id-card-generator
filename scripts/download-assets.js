/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const https = require('https');
const path = require('path');


const ASSETS = [
  'https://hhgoa.com/assets/Sun%20rise.png',
  'https://hhgoa.com/assets/2-47.svg',
  'https://hhgoa.com/assets/Hacker%20house.png',
  'https://hhgoa.com/assets/goa_hindi.svg',
  'https://hhgoa.com/assets/agenda.png',
  'https://hhgoa.com/assets/details.png',
  'https://hhgoa.com/assets/hackers.png',
  'https://hhgoa.com/assets/footer%20trees.png'
];

const DOWNLOAD_DIR = path.join(__dirname, '../public/assets');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

async function downloadFile(url) {
  const fileName = decodeURIComponent(url.split('/').pop());
  const filePath = path.join(DOWNLOAD_DIR, fileName);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${fileName}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Starting asset downloads...');
  for (const url of ASSETS) {
    try {
      await downloadFile(url);
    } catch (err) {
      console.error(err.message);
    }
  }
  console.log('All downloads completed.');
}

main();
