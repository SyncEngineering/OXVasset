import dotenv from 'dotenv';
import app from './src/app.js';

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;

/**
 * Start the server and listen on the configured port.
 */
app.listen(PORT, () => {
  console.log(`KSRTC Asset Management System — Server running on port ${PORT}`);
});
