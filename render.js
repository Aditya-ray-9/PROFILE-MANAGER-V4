// Basic server startup for Render.com
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files if they exist
app.use(express.static(path.join(__dirname, 'client/dist')));

// Register API routes
registerRoutes(app);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
