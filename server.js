const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const SITE_DIR = '_site';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml',
};

function resolveFilePath(urlPath) {
  const sitePath = path.join(__dirname, SITE_DIR);

  // Remove query string
  urlPath = urlPath.split('?')[0];

  // Try exact path first
  let filePath = path.join(sitePath, urlPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  // Try with .html extension (clean URLs)
  if (!path.extname(urlPath)) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      return htmlPath;
    }

    // Try index.html in directory
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

const server = http.createServer((req, res) => {
  const filePath = resolveFilePath(req.url);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1>');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${SITE_DIR}/`);
  console.log('Clean URLs supported (e.g., /landscape works)');
});
