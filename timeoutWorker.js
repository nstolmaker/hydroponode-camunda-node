require('dotenv').config()
const { Client, logger } = require('camunda-external-task-client-js');

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: process.env.CAMUNDA_BASE_URL + '/engine-rest' || 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 30000};

console.log("Using Camunda Engine @ "+config.baseUrl)
// create a Client instance with custom configuration
const client = new Client(config);

/**
 * sensor-timeout
 */
 client.subscribe('sensor-timeout', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {sensor-timeout} called. No sensor data received.`);
  await taskService.complete(task);
});
