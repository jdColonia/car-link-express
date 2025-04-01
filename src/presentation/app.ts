import express from 'express';
import cors from 'cors';

// Create an Express application
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parse incoming JSON requests

// Set up routes for the API under the '/api' path
app.use('/api', require('./routes'));

// Export the app to be used in other modules
export default app;