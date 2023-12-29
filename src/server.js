const http = require('http');
const https = require('https');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception: ${err.name}, ${err.message}`);
  console.error('🤔 App is shutting down...');
  process.exit(1);
});

const app = require('./app');
const { mongoConnect } = require('./utils/mongo');

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await mongoConnect();
    server.listen(PORT, () => {
      console.log(`✔ Server is listening on port: ${PORT} in ${process.env.NODE_ENV} environment.`);
    });
  } catch (err) {
    console.error(`🤔 There was an error starting the server ${err}`);
  }
})();

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.name} ${err.message}`);
  console.error('🤔 App is shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// Temporary
const apiUrl = 'https://worklopedia-2.onrender.com';

function makeApiCall() {
  https
    .get(apiUrl, (response) => {
      // You can ignore the response here
    })
    .on('error', (error) => {
      console.error('Error making API call:', error);
    });
}

// Call the API initially when the script starts
makeApiCall();

// Schedule the API call to run every 10 minutes (10 * 60 * 1000 milliseconds)
const interval = 10 * 60 * 1000;
setInterval(makeApiCall, interval);
