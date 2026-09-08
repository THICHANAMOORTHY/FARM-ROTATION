const serverless = require('serverless-http');
const app = require('../../backend/server');

// Wrap express app with serverless-http for Netlify Functions
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Ensure the context doesn't wait for empty event loop (important for DB connections)
  context.callbackWaitsForEmptyEventLoop = false;
  return await handler(event, context);
};
