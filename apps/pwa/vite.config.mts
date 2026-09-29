import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
const ip = Object.values(os.networkInterfaces()).flat().find(i => i?.family === 'IPv4' && !i?.internal)?.address || '127.0.0.1';
export default defineConfig({ root: fileURLToPath(new URL('.', import.meta.url)), server: { host: '0.0.0.0', port: 5176, strictPort: true, fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] }, proxy: { '/api': 'http://127.0.0.1:3004', '/rpc': { target: 'http://127.0.0.1:9655', rewrite: p => p.replace(/^\/rpc/, '') } } }, define: { 'import.meta.env.VITE_LAN_IP': JSON.stringify(ip) }, build: { outDir: '../../dist', emptyOutDir: true, rollupOptions: { output: { manualChunks: { ethers: ['ethers'], react: ['react', 'react-dom'] } } } } });
