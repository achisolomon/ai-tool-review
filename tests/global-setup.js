// Global setup: starts a CONNECT proxy that immediately closes connections to
// ad/analytics CDN hosts that are known to hang (TCP accept but no response).
// Without this, page.goto() blocks 30s waiting for the load event when CDN
// hosts are unreachable.

import http from 'http';
import net from 'net';

const BLOCKED_HOSTS = new Set([
  'pagead2.googlesyndication.com',
  'googleads.g.doubleclick.net',
  'adservice.google.com',
  'securepubads.g.doubleclick.net',
  'tpc.googlesyndication.com',
]);

let proxyServer;

export default async function globalSetup() {
  proxyServer = http.createServer((req, res) => {
    res.writeHead(405);
    res.end();
  });

  proxyServer.on('connect', (req, clientSocket) => {
    const [host] = req.url.split(':');
    if (BLOCKED_HOSTS.has(host)) {
      // Accept the tunnel but immediately close it, so Chrome fires a network
      // error and doesn't fall back to a direct connection.
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      clientSocket.destroy();
      return;
    }
    const [, portStr] = req.url.split(':');
    const port = parseInt(portStr) || 443;
    const serverSocket = net.connect(port, host, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });
    serverSocket.on('error', () => clientSocket.destroy());
    clientSocket.on('error', () => serverSocket.destroy());
  });

  await new Promise((resolve, reject) => {
    proxyServer.on('error', reject);
    proxyServer.listen(18080, resolve);
  });
  return async () => {
    await new Promise((resolve) => proxyServer.close(resolve));
  };
}
