// Server startup file for Render
import { spawn } from 'child_process';

// Start the server
const server = spawn('node', ['dist/index.js'], { stdio: 'inherit' });

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});
